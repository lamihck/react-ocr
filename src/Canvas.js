import React, { useState, useRef } from "react";
import CanvasDraw from "react-canvas-draw";
import Tesseract from "tesseract.js";

export default function Canvas() {
  const [confidence, setConfidence] = useState();
  const [isCalculated, setCalculated] = useState(false);
  const [isDrawing, setDrawing] = useState(false);
  const canvasRef = useRef(null);

  let clear = () => {
    canvasRef.current && canvasRef.current.clear();
    setCalculated(false);
  };
  let ocr = () => {
    let canvas = canvasRef.current && canvasRef.current.canvas;
    recognize(canvas.drawing).then(({ data }) => {
      //console.log(data);
      setConfidence(data.confidence);
      clear();
      if (data.confidence > 60) {
        let canvas = canvasRef.current.canvas.drawing;
        let ctx = Object.assign(canvas.getContext("2d"), {
          font: "60px Arial",
          textBaseline: "middle",
          textAlign: "center"
        });
        ctx.fillText(data.text, canvas.width / 2, canvas.height / 2);
        setCalculated(true);
      }
    });
  };
  let recognize = async (image, langs, options) => {
    const worker = Tesseract.createWorker(options);
    await worker.load();
    await worker.loadLanguage(langs);
    await worker.initialize(langs);
    await worker.setParameters({
      tessedit_char_whitelist: "0123456789"
    });
    return worker.recognize(image).finally(async () => {
      await worker.terminate();
    });
  };
  let timeoutId = null;
  let onChange = () => {
    console.log("OnChange");
    clearTimer();
    timeoutId = setTimeout(() => {
      console.log("Timeout");
      ocr();
    }, 3000);
    return true;
  };
  let clearTimer = () => clearTimeout(timeoutId);
  let onDrawing = () => {
    isCalculated && clear();
    setDrawing(true);
    clearTimer();
  };
  return (
    <>
      <div
        onTouchMove={() => {
          if (isDrawing) console.log("onTouchMove");
          isDrawing && onChange();
        }}
        onMouseMove={() => {
          if (isDrawing) console.log("onMouseMove");
          isDrawing && onChange();
        }}
        onMouseDown={onDrawing}
        onTouchStart={onDrawing}
      >
        <CanvasDraw
          ref={canvasRef}
          onChange={() => {
            onChange();
            setDrawing(false);
          }}
          immediateLoading={true}
          canvasWidth={100}
          canvasHeight={100}
          lazyRadius={0}
          hideGrid={true}
          brushRadius={3}
          style={{
            boxShadow:
              "0 13px 27px -5px rgba(50, 50, 93, 0.25),    0 8px 16px -8px rgba(0, 0, 0, 0.3)"
          }}
        />
      </div>
      <button onClick={clear}>Clear</button>
      <button onClick={ocr}>ocr</button>
      <p>confidence: {confidence}</p>
      <p>isCalculated: {isCalculated.toString()}</p>
      <p>isDrawing: {isDrawing.toString()}</p>
    </>
  );
}
