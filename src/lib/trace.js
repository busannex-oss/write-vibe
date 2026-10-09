// One trace id per browser session, shared by AI calls and error logs
// so a user's actions can be followed end-to-end in the System Traces viewer.
export function getTraceId() {
  let id = sessionStorage.getItem("wv_trace_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("wv_trace_id", id);
  }
  return id;
}