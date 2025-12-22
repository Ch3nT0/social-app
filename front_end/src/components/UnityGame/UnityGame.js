import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

const UnityGame = () => {
  // Cấu hình các đường dẫn file build
  // Đảm bảo các file này nằm trong public/unity-build/
  const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "unity-build/Build.loader.js",
    dataUrl: "unity-build/webgl.data", 
    frameworkUrl: "unity-build/Build.framework.js",
    codeUrl: "unity-build/build.wasm",          
  });

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      <h2>Trận Chiến Xe Tăng</h2>
      
      <div style={{ 
        position: "relative", 
        width: "960px", 
        height: "600px", 
        margin: "auto",
        border: "5px solid #2c3e50",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#000"
      }}>
        {/* Màn hình Loading */}
        {!isLoaded && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white"
          }}>
            <p>Đang tải dữ liệu: {Math.round(loadingProgression * 100)}%</p>
            <div style={{ width: "200px", height: "10px", background: "#555" }}>
              <div style={{ 
                width: `${loadingProgression * 100}%`, 
                height: "100%", 
                background: "#3498db" 
              }} />
            </div>
          </div>
        )}

        <Unity
          unityProvider={unityProvider}
          style={{
            width: "100%",
            height: "100%",
            visibility: isLoaded ? "visible" : "hidden",
          }}
        />
      </div>
      
      <div style={{ marginTop: "10px" }}>
        <p>Sử dụng các phím mũi tên hoặc WASD để di chuyển xe tăng.</p>
      </div>
    </div>
  );
};

export default UnityGame;