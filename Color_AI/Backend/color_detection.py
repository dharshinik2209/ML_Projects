from flask import Flask, request, jsonify
from flask_cors import CORS

import cv2
import numpy as np
import pandas as pd
import os


app = Flask(__name__)

# Allow requests from your frontend
CORS(app)


# ==========================================
# LOAD COLORS CSV
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

csv_path = os.path.join(BASE_DIR, "colors.csv")

index = ["color", "color_name", "hex", "R", "G", "B"]

csv = pd.read_csv(
    csv_path,
    names=index,
    header=None
)


# ==========================================
# FIND COLOR NAME
# ==========================================

def getColorName(R, G, B):

    minimum = 10000
    cname = "Unknown"

    for i in range(len(csv)):

        d = (
            abs(R - int(csv.loc[i, "R"])) +
            abs(G - int(csv.loc[i, "G"])) +
            abs(B - int(csv.loc[i, "B"]))
        )

        if d <= minimum:

            minimum = d
            cname = csv.loc[i, "color_name"]

    return cname


# ==========================================
# GET HEX COLOR
# ==========================================

def rgb_to_hex(R, G, B):

    return "#{:02X}{:02X}{:02X}".format(
        R,
        G,
        B
    )


# ==========================================
# HOME ROUTE
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Color Identification API is running!"
    })


# ==========================================
# COLOR DETECTION API
# ==========================================

@app.route("/detect", methods=["POST"])
def detect_color():

    try:

        # ----------------------------------
        # Check image
        # ----------------------------------

        if "image" not in request.files:

            return jsonify({
                "error": "No image uploaded"
            }), 400


        image_file = request.files["image"]


        # ----------------------------------
        # Get X and Y coordinates
        # ----------------------------------

        x = int(request.form["x"])
        y = int(request.form["y"])


        # ----------------------------------
        # Read uploaded image
        # ----------------------------------

        file_bytes = np.frombuffer(
            image_file.read(),
            np.uint8
        )

        img = cv2.imdecode(
            file_bytes,
            cv2.IMREAD_COLOR
        )


        if img is None:

            return jsonify({
                "error": "Unable to read image"
            }), 400


        # ----------------------------------
        # Check coordinates
        # ----------------------------------

        height, width = img.shape[:2]

        if x < 0 or x >= width or y < 0 or y >= height:

            return jsonify({
                "error": "Invalid coordinates"
            }), 400


        # ----------------------------------
        # Get BGR pixel
        # ----------------------------------

        b, g, r = img[y, x]

        b = int(b)
        g = int(g)
        r = int(r)


        # ----------------------------------
        # Find color name
        # ----------------------------------

        color_name = getColorName(
            r,
            g,
            b
        )


        # ----------------------------------
        # Convert RGB to HEX
        # ----------------------------------

        hex_color = rgb_to_hex(
            r,
            g,
            b
        )


        # ----------------------------------
        # Send response to frontend
        # ----------------------------------

        return jsonify({

            "color_name": color_name,

            "hex": hex_color,

            "rgb": [
                r,
                g,
                b
            ]

        })


    except Exception as e:

        print("ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ==========================================
# RUN FLASK
# ==========================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )