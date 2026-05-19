// Tweaks.jsx — flashlight-era tweaks
function TweaksPanel({ tweaks, setTweaks }) {
  const update = (k, v) => setTweaks({ ...tweaks, [k]: v });
  return (
    <div className="tweaks-panel">
      <h4>Tweaks</h4>
      <div className="tweak">
        <label>Beam Size</label>
        <input
          type="range" min="140" max="450" step="10"
          value={tweaks.beamSize || 260}
          onChange={(e) => update('beamSize', parseInt(e.target.value))}
        />
      </div>
      <div className="tweak">
        <label>Beam Warmth</label>
        <select value={tweaks.beamWarmth} onChange={(e) => update('beamWarmth', e.target.value)}>
          <option value="amber">Amber (warm)</option>
          <option value="warm">Warm White</option>
          <option value="cool">Cool White</option>
        </select>
      </div>
      <div className="tweak">
        <label>Headline</label>
        <select value={tweaks.headline} onChange={(e) => update('headline', e.target.value)}>
          <option value="address">Your Address. Set in Stone.</option>
          <option value="raw">Raw Stone. Refined Light.</option>
          <option value="light">Light Up Your Landing.</option>
        </select>
      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
