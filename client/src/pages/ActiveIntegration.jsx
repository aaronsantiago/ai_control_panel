import {useState} from "react";
import {useNavigate} from "react-router-dom";

function ActiveIntegration(props) {
  return (
    <div style={{width: "100%", height: "100%"}}>
      {props.activeIntegration != null ? <iframe src={"http://" + window.location.hostname + ":" + props.activeIntegration.port} style={{width: "100%", height: "100%"}} sandbox='allow-scripts allow-modal' loading='eager'></iframe>
      : <div style={{width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>No active integration</div> }
    </div>
  );
}

export default ActiveIntegration;
