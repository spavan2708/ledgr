import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { extractMLPipelineFeatures } from "@/lib/financial/ml-features";

export async function POST(req: Request) {
  try {
    const { profile, goals } = await req.json();
    
    // Extract features on the backend
    const features = extractMLPipelineFeatures(profile, goals);

    const scriptPath = path.resolve(process.cwd(), "../ml_pipeline/src/predict_cli.py");
    const pythonPath = path.resolve(process.cwd(), "../ml_pipeline/venv/Scripts/python.exe");

    const result = await new Promise<string>((resolve, reject) => {
      const child = spawn(pythonPath, [scriptPath]);
      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        } else {
          resolve(stdout);
        }
      });

      child.on("error", (err) => reject(err));

      child.stdin.write(JSON.stringify(features));
      child.stdin.end();
    });

    const parsedResult = JSON.parse(result);
    if (parsedResult.error) {
      throw new Error(parsedResult.error);
    }

    return NextResponse.json({
      ml_risk_profile: parsedResult
    });

  } catch (error: any) {
    console.error("ML Prediction Error:", error);
    return NextResponse.json(
      { error: "Failed to generate ML risk profile" },
      { status: 500 }
    );
  }
}
