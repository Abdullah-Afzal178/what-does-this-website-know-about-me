/**
 * Everything a page can read from the browser with plain JavaScript and no
 * permission prompt. All of it is computed in the visitor's own browser and
 * never leaves it — the point is to show what is readable, not to collect it.
 *
 * This deliberately does NOT use a React client component. Hydration can be
 * deferred or skipped (background tabs, slow or blocked chunk loads), which
 * would leave the section stuck on its placeholder. A plain inline script runs
 * as soon as the element is parsed, so the section always fills in.
 */
export function ClientSignals() {
  return (
    <>
      <div id="client-signals">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Reading what your browser exposes…</p>
          <p className="mt-1 text-xs text-slate-400">
            This section needs JavaScript. If it does not fill in, your browser is
            blocking scripts — which is exactly the defence this page is describing.
          </p>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: SIGNAL_SCRIPT }} />
    </>
  );
}

/** Runs immediately in the browser; writes the same markup React would have. */
const SIGNAL_SCRIPT = `(function () {
  var mount = document.getElementById("client-signals");
  if (!mount) return;

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function pad(value) { return value < 10 ? "0" + value : String(value); }

  function formatOffset(minutes) {
    var sign = minutes < 0 ? "-" : "+";
    var absolute = Math.abs(minutes);
    var hours = Math.floor(absolute / 60);
    var rest = absolute % 60;
    return rest === 0 ? "UTC" + sign + hours : "UTC" + sign + hours + ":" + pad(rest);
  }

  function readGpu() {
    try {
      var canvas = document.createElement("canvas");
      var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "hidden";
      var info = gl.getExtension("WEBGL_debug_renderer_info");
      return (info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) || "hidden";
    } catch (error) { return "hidden"; }
  }

  function fingerprint() {
    try {
      var canvas = document.createElement("canvas");
      canvas.width = 240; canvas.height = 60;
      var context = canvas.getContext("2d");
      if (!context) return "unavailable";
      context.textBaseline = "top";
      context.font = "16px 'Arial'";
      context.fillStyle = "#f60";
      context.fillRect(0, 0, 120, 30);
      context.fillStyle = "#069";
      context.fillText("Fingerprint \\u2728", 2, 16);
      context.fillStyle = "rgba(102, 200, 0, 0.7)";
      context.fillText("Fingerprint \\u2728", 4, 22);
      var data = canvas.toDataURL();
      var value = 0x811c9dc5;
      for (var index = 0; index < data.length; index += 1) {
        value ^= data.charCodeAt(index);
        value = Math.imul(value, 0x01000193);
      }
      var hex = (value >>> 0).toString(16);
      while (hex.length < 8) hex = "0" + hex;
      return hex;
    } catch (error) { return "unavailable"; }
  }

  function hasLocalStorage() {
    try {
      window.localStorage.setItem("__probe__", "1");
      window.localStorage.removeItem("__probe__");
      return true;
    } catch (error) { return false; }
  }

  var nav = navigator;
  var conn = nav.connection || {};
  var uaData = nav.userAgentData || {};
  var orientation = (window.screen.orientation || {}).type || "unknown";

  var groups = [
    { title: "Your screen", note: "Read instantly, no permission prompt.", signals: [
      { label: "Screen size", value: window.screen.width + " \\u00d7 " + window.screen.height,
        hint: window.screen.availWidth + " \\u00d7 " + window.screen.availHeight + " usable" },
      { label: "Browser window", value: window.innerWidth + " \\u00d7 " + window.innerHeight },
      { label: "Pixel ratio", value: window.devicePixelRatio + "\\u00d7" },
      { label: "Colour depth", value: window.screen.colorDepth + "-bit" },
      { label: "Orientation", value: orientation }
    ]},
    { title: "Your hardware", note: "Enough to narrow you down to a small group of devices.", signals: [
      { label: "CPU cores", value: nav.hardwareConcurrency ? String(nav.hardwareConcurrency) : "hidden" },
      { label: "Device memory", value: nav.deviceMemory ? nav.deviceMemory + " GB or more" : "hidden" },
      { label: "Touch points", value: String(nav.maxTouchPoints || 0),
        hint: (nav.maxTouchPoints || 0) > 0 ? "touch screen detected" : "no touch screen" },
      { label: "Platform", value: uaData.platform || nav.platform || "hidden" },
      { label: "Graphics card", value: readGpu(), hint: "read via WebGL, no permission needed" }
    ]},
    { title: "Your locale", note: "A second opinion on where you are, independent of your IP.", signals: [
      { label: "Languages", value: (nav.languages || [nav.language]).join(", ") || "unknown" },
      { label: "Time zone", value: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown" },
      { label: "Clock offset", value: formatOffset(-new Date().getTimezoneOffset()),
        hint: "reveals your region even without your IP" },
      { label: "Local time", value: new Date().toLocaleString() }
    ]},
    { title: "Your preferences", note: "Settings you never told this site about.", signals: [
      { label: "Cookies enabled", value: nav.cookieEnabled ? "yes" : "no" },
      { label: "Local storage", value: hasLocalStorage() ? "available" : "blocked" },
      { label: "Do Not Track", value: nav.doNotTrack === "1" ? "on" : nav.doNotTrack === "0" ? "off" : "not set",
        hint: "almost every site ignores this" },
      { label: "Dark mode", value: matchMedia("(prefers-color-scheme: dark)").matches ? "on" : "off" },
      { label: "Reduced motion", value: matchMedia("(prefers-reduced-motion: reduce)").matches ? "requested" : "off" },
      { label: "Connection", value: conn.effectiveType || "hidden",
        hint: typeof conn.rtt === "number" ? "~" + conn.rtt + " ms round trip" : "" }
    ]},
    { title: "Your fingerprint", note: "Combined, these signals identify a browser without any cookie.", signals: [
      { label: "Canvas fingerprint", value: fingerprint(),
        hint: "a stable ID derived from how your device draws \\u2014 no cookie required" }
    ]}
  ];

  var html = '<div class="space-y-6">';

  groups.forEach(function (group) {
    html += '<div>';
    html += '<h3 class="text-sm font-semibold text-slate-950">' + esc(group.title) + '</h3>';
    html += '<p class="mt-0.5 text-sm text-slate-500">' + esc(group.note) + '</p>';
    html += '<dl class="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">';

    group.signals.forEach(function (signal) {
      html += '<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">';
      html += '<dt class="text-sm font-medium text-slate-500">' + esc(signal.label) + '</dt>';
      html += '<dd class="mt-2 break-words text-base font-semibold text-slate-950">' + esc(signal.value) + '</dd>';
      if (signal.hint) {
        html += '<p class="mt-1.5 text-xs leading-5 text-slate-400">' + esc(signal.hint) + '</p>';
      }
      html += '</div>';
    });

    html += '</dl></div>';
  });

  html += '</div>';
  mount.innerHTML = html;
})();`;
