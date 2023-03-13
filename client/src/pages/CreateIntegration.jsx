import {useState} from "react";
import {useNavigate} from "react-router-dom";

function CreateIntegration() {
  const [directory, setDirectory] = useState("");
  const [binary, setBinary] = useState("");
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  function submitIntegration() {
    // POST request using fetch inside useEffect React hook
    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        directory: directory,
        binary: binary,
        url: url,
      }),
    };
    fetch("/api/createIntegration", requestOptions)
      .then((response) => navigate("/"))
  }
  return (
    <div>
      <div>
        <label>
          Directory:
          <input
            type="text"
            value={directory}
            onChange={(e) => setDirectory(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Binary:
          <input
            type="text"
            value={binary}
            onChange={(e) => setBinary(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          URL:
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
      </div>
      <button onClick={submitIntegration}>Submit</button>
    </div>
  );
}

export default CreateIntegration;
