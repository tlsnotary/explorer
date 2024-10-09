use k256::pkcs8::DecodePublicKey;
use neon::prelude::*;
use tlsn_core::{
    presentation::{Presentation, PresentationOutput},
    signing::VerifyingKey,
    CryptoProvider,
};

fn verify(mut cx: FunctionContext) -> JsResult<JsObject> {
    let presentation_cx = cx.argument::<JsString>(0)?.value(&mut cx);
    let notary_key_cx = cx.argument::<JsString>(1)?.value(&mut cx);

    let (sent, recv, time) =
        verify_presentation(presentation_cx, notary_key_cx).or_else(|e| cx.throw_error(e))?;

    let obj: Handle<JsObject> = cx.empty_object();
    let sent_str = cx.string(sent);
    obj.set(&mut cx, "sent", sent_str)?;
    let recv_str = cx.string(recv);
    obj.set(&mut cx, "recv", recv_str)?;
    let session_time = cx.number(time as f64);
    obj.set(&mut cx, "time", session_time)?;

    Ok(obj)
}

fn verify_presentation(
    presentation_cx: String,
    notary_key_cx: String,
) -> Result<(String, String, u64), String> {
    // Deserialize the presentation
    let bytes: Vec<u8> = hex::decode(presentation_cx.as_str()).map_err(|e| e.to_string())?;
    let presentation: Presentation = bincode::deserialize(&bytes).map_err(|e| e.to_string())?;

    // Verify the session proof against the Notary's public key
    let VerifyingKey {
        alg: _,
        data: key_data,
    } = presentation.verifying_key();

    let notary_key = k256::PublicKey::from_public_key_pem(notary_key_cx.as_str())
        .map_err(|x| format!("Invalid notary key: {}", x))?;
    let verifying_key = k256::PublicKey::from_sec1_bytes(key_data)
        .map_err(|x| format!("Invalid verifying key: {}", x))?;

    if notary_key != verifying_key {
        Err("The verifying key does not match the notary key")?;
    }

    // Verify the presentation.
    let provider = CryptoProvider::default();
    let PresentationOutput {
        connection_info,
        transcript,
        ..
    } = presentation
        .verify(&provider)
        .map_err(|x| format!("Presentation verification failed: {}", x))?;

    let (sent, recv) = transcript
        .map(|mut partial_transcript| {
            // Set the unauthenticated bytes so they are distinguishable.
            partial_transcript.set_unauthed(b'X');
            let sent = String::from_utf8_lossy(partial_transcript.sent_unsafe()).to_string();
            let recv = String::from_utf8_lossy(partial_transcript.received_unsafe()).to_string();
            (sent, recv)
        })
        .unwrap_or_default();

    Ok((sent, recv, connection_info.time))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("verify", verify)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::Deserialize;

    #[derive(Deserialize, Debug)]
    struct Presentation {
        version: String,
        data: String,
    }

    /// get example presentation from example.com for testing
    fn example_presentation() -> String {
        let example = include_str!("example.json");
        let presentation: Presentation = serde_json::from_str(&example).unwrap();
        assert_eq!("0.1.0-alpha.7", presentation.version);
        presentation.data
    }

    #[test]
    fn test_verify() {
        let notary_key_cx = String::from(
            "-----BEGIN PUBLIC KEY-----
MDYwEAYHKoZIzj0CAQYFK4EEAAoDIgADe0jxnBObaIj7Xjg6TXLCM1GG/VhY5650
OrS/jgcbBuc=
-----END PUBLIC KEY-----",
        );

        let (sent, recv, time) =
            verify_presentation(example_presentation(), notary_key_cx).unwrap();

        assert_eq!(1728416631, time);
        assert!(sent.contains("host: example.com"));
        assert!(sent.contains("XXXXXXXXXXXXXXXXXX"));
        assert!(recv.contains("<title>Example Domain</title>"));
        assert!(recv.contains("Date: Tue, 08 Oct 2024"));
    }

    #[test]
    fn test_verify_wrong_key() {
        let notary_key_cx = String::from(
            "-----BEGIN PUBLIC KEY-----
MDYwEAYHKoZIzj0CAQYFK4EEAAoDIgADZT9nJiwhGESLjwQNnZ2MsZ1xwjGzvmhF
xFi8Vjzanlg=
-----END PUBLIC KEY-----",
        );

        let res = verify_presentation(example_presentation(), notary_key_cx);

        assert_eq!(
            res,
            Err("The verifying key does not match the notary key".to_string())
        );
    }
}
