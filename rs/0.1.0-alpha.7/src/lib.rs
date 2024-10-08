use std::{str, time::Duration};

use k256::pkcs8::DecodePublicKey;
use neon::prelude::*;
use tlsn_core::{
    presentation::{Presentation, PresentationOutput},
    signing::VerifyingKey,
    CryptoProvider,
};

fn verify(mut cx: FunctionContext) -> JsResult<JsObject> {
    // Deserialize the presentation
    let presentation = cx.argument::<JsString>(0)?.value(&mut cx);
    let bytes: Vec<u8> = hex::decode(presentation.as_str()).expect("Decoding failed");
    let presentation: Presentation = bincode::deserialize(&bytes).expect("Deserialize failed");
    let notary_key_cx = cx.argument::<JsString>(1)?.value(&mut cx);

    // Verify the session proof against the Notary's public key
    let VerifyingKey {
        alg: _,
        data: key_data,
    } = presentation.verifying_key();

    let notary_key = k256::PublicKey::from_public_key_pem(notary_key_cx.as_str()).unwrap();
    let verifying_key = k256::PublicKey::from_sec1_bytes(&key_data).unwrap();

    if notary_key != verifying_key {
        cx.throw_error("The verifying key does not match the notary key")?;
    }

    // Verify the presentation.
    let provider = CryptoProvider::default();
    let PresentationOutput {
        server_name,
        connection_info,
        transcript,
        ..
    } = presentation.verify(&provider).unwrap(); //TODO unwrap

    // The time at which the connection was started.
    let _time = chrono::DateTime::UNIX_EPOCH + Duration::from_secs(connection_info.time);
    let _server_name = server_name.unwrap();

    let mut partial_transcript = transcript.unwrap();
    // Set the unauthenticated bytes so they are distinguishable.
    partial_transcript.set_unauthed(b'X');

    let sent = String::from_utf8_lossy(partial_transcript.sent_unsafe());
    let recv = String::from_utf8_lossy(partial_transcript.received_unsafe());

    let obj: Handle<JsObject> = cx.empty_object();

    let sent_str = cx.string(sent);
    let recv_str = cx.string(recv);
    let session_time = cx.number(connection_info.time as f64);
    obj.set(&mut cx, "sent", sent_str)?;
    obj.set(&mut cx, "recv", recv_str)?;
    obj.set(&mut cx, "time", session_time)?;

    Ok(obj)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("verify", verify)?;
    Ok(())
}
