# NusaQC Evaluation — Ringkasan Skor Saat Ini

| Skrip Test Suite | Fokus Evaluasi | Skor Saat Ini | Status / Keterangan |
| --- | --- | --- | --- |
| 1. test_core_accuracy.py | Freshness F1 & Defect Deteksi | Freshness F1: 96.1% | Defect Recall: 76.0% (FNR: 24.0%) | Evaluasi seluruh dataset riil (380 Freshness, 25 Defect) |
| 2. test_optical_robustness.py | Wet Glare & Pencahayaan | Glare FAR: 0.00% | Low-Light F1: 41.6% | Ketahanan optik: Tahan pantulan kilau air; degradasi pada redup <50 lux |
| 3. test_edge_cases.py | Empty Frame & Oklusi | Phantom: 0.0% | Oklusi 50%: 28.0% | Konveyor kosong 100% bersih; oklusi berat >50% blind spot kamera tunggal |
| 4. test_agentic_adjudication.py | Resolusi Kasus CONDITIONAL | Resolusi: 100.0% | Fallback: 100.0% | Penyelesaian otomatis kasus borderline via VLM & graceful fallback ke operator |
| 5. test_async_stream.py | Throughput Aliran Konveyor | 4.40 FPS | 4697 ms Latency | Pipeline asinkronus kontinu; zero memory leak |
| 6. test_quantization_performance.py | Efisiensi Kuantisasi Model | FP32: 42.7 MB -> INT8: 11.0 MB | Model terkuantisasi INT8 siap deployment edge |


*Dihasilkan secara otomatis oleh NusaQC Automated Test Suite orchestrator.*
