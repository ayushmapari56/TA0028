import cv2
import numpy as np
import os
import time

def get_entropy(data):
    gray = cv2.cvtColor(data, cv2.COLOR_BGR2GRAY)
    hist = cv2.calcHist([gray],[0],None,[256],[0,256])
    hist_norm = hist.ravel() / hist.sum()
    return -np.sum(hist_norm * np.log2(hist_norm + 1e-7))

def extract_forensics(video_path):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return None
    
    # Get total frames and seek to 50% for a representative face frame
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.set(cv2.CAP_PROP_POS_FRAMES, total_frames // 2)
    
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        return None

    # Laplacian Variance (Sharpness)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # Entropy (Ghosting Check)
    height, width = gray.shape
    center_y, center_x = height // 2, width // 2
    core = frame[center_y - 50:center_y + 50, center_x - 50:center_x + 50]
    periph = frame[0:100, 0:100]
    
    core_entropy = get_entropy(core)
    periph_entropy = get_entropy(periph)
    ghosting_val = abs(core_entropy - periph_entropy)
    
    return {
        "sharpness": laplacian_var,
        "ghosting": ghosting_val,
        "entropy": core_entropy
    }

def calibrate():
    base_path = r"C:\Users\sharvari\Downloads\archive (1)"
    orig_path = os.path.join(base_path, "DFD_original sequences")
    fake_path = os.path.join(base_path, "DFD_manipulated_sequences", "DFD_manipulated_sequences")
    
    print(f"🚀 Starting RAKSHAK Model Calibration on DFD Dataset...")
    
    results = {"original": [], "manipulated": []}
    
    # Fast sampling: 30 videos from each
    sample_size = 30
    
    for label, folder in [("original", orig_path), ("manipulated", fake_path)]:
        videos = [v for v in os.listdir(folder) if v.endswith(".mp4")][:sample_size]
        print(f"Analyzing {label} set ({len(videos)} samples)...")
        
        for v in videos:
            v_path = os.path.join(folder, v)
            data = extract_forensics(v_path)
            if data:
                results[label].append(data)
    
    # Calculate Averages
    orig_sharp = np.mean([r['sharpness'] for r in results['original']])
    fake_sharp = np.mean([r['sharpness'] for r in results['manipulated']])
    
    orig_ghost = np.mean([r['ghosting'] for r in results['original']])
    fake_ghost = np.mean([r['ghosting'] for r in results['manipulated']])
    
    print("\n--- CALIBRATION COMPLETE ---")
    print(f"Avg Original Sharpness: {orig_sharp:.2f}")
    print(f"Avg Manipulated Sharpness: {fake_sharp:.2f}")
    print(f"Avg Original Ghosting: {orig_ghost:.2f}")
    print(f"Avg Manipulated Ghosting: {fake_ghost:.2f}")
    
    # Heuristic Optimization logic
    # Usually: Fakes are 'softer' or have 'jitter'/ghosting
    recommended_ghosting_threshold = (orig_ghost + fake_ghost) / 2
    recommended_sharpness_threshold = (orig_sharp + fake_sharp) / 2
    
    print(f"\n✅ Recommended Thresholds for detector.py:")
    print(f"GHOSTING_THRESHOLD: {recommended_ghosting_threshold:.4f}")
    print(f"SHARPNESS_THRESHOLD: {recommended_sharpness_threshold:.2f}")

if __name__ == "__main__":
    calibrate()
