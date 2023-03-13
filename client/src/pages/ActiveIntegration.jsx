import {useState} from "react";
import {useNavigate} from "react-router-dom";

function ActiveIntegration() {
  return (
    <div style={{width: "100%", height: "100%"}}>
      <iframe src="http://localhost:7860" style={{width: "100%", height: "100%"}} sandbox='allow-scripts allow-modal' loading='eager'></iframe>
    </div>
  );
}

export default ActiveIntegration;
