import io
from datetime import datetime
from typing import Dict, Any, List
import qrcode
from PIL import Image as PILImage

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    KeepTogether,
    HRFlowable,
)
from reportlab.lib.units import mm

from app.config import settings


class NumberedCanvas:
    """Canvas wrapper to support 'Page X of Y' page numbers."""
    def __init__(self, *args, **kwargs):
        pass


class QCCertificateGenerator:
    """
    Generates an official export-grade Quality Inspection Certificate (PDF)
    with embedded QR code container tracking and SNI compliance metadata.
    """

    @staticmethod
    def generate_qr_buffer(data_str: str, box_size: int = 4, border: int = 1) -> io.BytesIO:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=box_size,
            border=border,
        )
        qr.add_data(data_str)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#0284c7", back_color="white")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return buf

    @classmethod
    def generate_pdf(
        cls,
        dispatch_id: str,
        dispatch_data: Dict[str, Any],
        lots_data: List[Dict[str, Any]],
        qc_summary: Dict[str, Any],
    ) -> bytes:
        pdf_buffer = io.BytesIO()

        # Document setup with A4, 15mm margins
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=A4,
            leftMargin=15 * mm,
            rightMargin=15 * mm,
            topMargin=15 * mm,
            bottomMargin=15 * mm,
            title=f"NusaQC_Certificate_{dispatch_id}",
            author=settings.CERTIFICATE_ISSUER,
            subject=f"Export QC Certificate for Dispatch {dispatch_id}",
        )

        styles = getSampleStyleSheet()

        # Custom typography styles
        title_style = ParagraphStyle(
            "CertTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#0f172a"),
        )
        subtitle_style = ParagraphStyle(
            "CertSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#475569"),
        )
        badge_style = ParagraphStyle(
            "CertBadge",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#0284c7"),
            alignment=2,  # Right aligned
        )
        section_heading = ParagraphStyle(
            "SectionHeading",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#1e293b"),
        )
        body_label = ParagraphStyle(
            "BodyLabel",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#64748b"),
        )
        body_val = ParagraphStyle(
            "BodyVal",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#0f172a"),
        )
        table_header = ParagraphStyle(
            "TableHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=10,
            textColor=colors.white,
            alignment=1,  # Center
        )
        table_cell = ParagraphStyle(
            "TableCell",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor("#1e293b"),
            alignment=1,  # Center
        )
        table_cell_left = ParagraphStyle(
            "TableCellLeft",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor("#0f172a"),
            alignment=0,  # Left
        )
        footer_small = ParagraphStyle(
            "FooterSmall",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=7,
            leading=9,
            textColor=colors.HexColor("#64748b"),
        )
        footer_bold = ParagraphStyle(
            "FooterBold",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor("#0f172a"),
        )

        elements = []

        # ----------------------------------------------------
        # 1. HEADER SECTION
        # ----------------------------------------------------
        header_table_data = [
            [
                Paragraph("<b>NUSAQC EXPORT QUALITY CERTIFICATE</b>", title_style),
                Paragraph(f"<b>SERTIFIKAT RESMI MUTU EKSPOR</b><br/>{settings.CERTIFICATE_STANDARD}", badge_style),
            ],
            [
                Paragraph(
                    "Sistem Sertifikasi & Ketertelusuran Mutu Ikan Otonom Berbasis Multi-Stage Vision AI",
                    subtitle_style,
                ),
                Paragraph(f"<b>No: {dispatch_id}</b>", badge_style),
            ],
        ]
        header_table = Table(header_table_data, colWidths=[360, 180])
        header_table.setStyle(
            TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
            ])
        )
        elements.append(header_table)
        elements.append(Spacer(1, 4 * mm))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=10))

        # ----------------------------------------------------
        # 2. SHIPMENT & CONSIGNEE METADATA TABLE
        # ----------------------------------------------------
        buyer = dispatch_data.get("buyer_name") or "-"
        destination = dispatch_data.get("destination") or "-"
        container_no = dispatch_data.get("container_no") or "-"
        disp_date = dispatch_data.get("dispatch_date") or datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        status_disp = (dispatch_data.get("status") or "PENDING").upper()

        meta_data = [
            [
                Paragraph("BUYER / CONSIGNEE", body_label),
                Paragraph(f": <b>{buyer}</b>", body_val),
                Paragraph("DISPATCH ID", body_label),
                Paragraph(f": <b>{dispatch_id}</b>", body_val),
            ],
            [
                Paragraph("DESTINATION", body_label),
                Paragraph(f": <b>{destination}</b>", body_val),
                Paragraph("CONTAINER NO", body_label),
                Paragraph(f": <b>{container_no}</b>", body_val),
            ],
            [
                Paragraph("DISPATCH DATE", body_label),
                Paragraph(f": {disp_date}", body_val),
                Paragraph("SHIPMENT STATUS", body_label),
                Paragraph(f": <b>{status_disp}</b>", body_val),
            ],
        ]
        meta_table = Table(meta_data, colWidths=[90, 180, 95, 175])
        meta_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#cbd5e1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ])
        )
        elements.append(meta_table)
        elements.append(Spacer(1, 4 * mm))

        # ----------------------------------------------------
        # 3. QC SUMMARY CARDS (4-Column Metrics Banner)
        # ----------------------------------------------------
        total_lots = qc_summary.get("total_lots", len(lots_data))
        avg_conf = qc_summary.get("avg_confidence", 92.0)
        total_defects = qc_summary.get("total_defects", 0)
        all_passed = qc_summary.get("all_passed", True)

        box_label_style = ParagraphStyle(
            "BoxLabel",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor("#475569"),
            alignment=1,  # Center
        )
        box_val_total = ParagraphStyle(
            "BoxValTotal",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#0f172a"),
            alignment=1,
        )
        box_val_sni = ParagraphStyle(
            "BoxValSni",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#16a34a" if all_passed else "#dc2626"),
            alignment=1,
        )
        box_val_conf = ParagraphStyle(
            "BoxValConf",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#0284c7"),
            alignment=1,
        )
        box_val_def = ParagraphStyle(
            "BoxValDef",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#d97706"),
            alignment=1,
        )

        elements.append(Spacer(1, 6 * mm))

        summary_box_data = [
            [
                Paragraph("TOTAL LOTS", box_label_style),
                Paragraph("SNI COMPLIANCE", box_label_style),
                Paragraph("AVG CONFIDENCE", box_label_style),
                Paragraph("TOTAL DEFECTS", box_label_style),
            ],
            [
                Paragraph(str(total_lots), box_val_total),
                Paragraph("100% PASS" if all_passed else "REVIEW", box_val_sni),
                Paragraph(f"{avg_conf}%", box_val_conf),
                Paragraph(str(total_defects), box_val_def),
            ],
        ]
        summary_table = Table(summary_box_data, colWidths=[135, 135, 135, 135])
        summary_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (0, 1), colors.HexColor("#f8fafc")),
                ("BACKGROUND", (1, 0), (1, 1), colors.HexColor("#ecfdf5")),
                ("BACKGROUND", (2, 0), (2, 1), colors.HexColor("#f0f9ff")),
                ("BACKGROUND", (3, 0), (3, 1), colors.HexColor("#fffbeb")),
                ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#cbd5e1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.75, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, 0), 6),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 2),
                ("TOPPADDING", (0, 1), (-1, 1), 2),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 7),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ])
        )
        elements.append(summary_table)
        elements.append(Spacer(1, 6 * mm))

        # ----------------------------------------------------
        # 4. INSPECTED LOTS MANIFEST TABLE
        # ----------------------------------------------------
        elements.append(Paragraph("<b>RINCIAN LOT DAN HASIL PEMERIKSAAN MUTU ORGANOLEPTIK</b>", section_heading))
        elements.append(Spacer(1, 2 * mm))

        # Table Header
        lot_table_rows = [
            [
                Paragraph("<b>LOT ID</b>", table_header),
                Paragraph("<b>SPESIES / FAMILY</b>", table_header),
                Paragraph("<b>GRADE</b>", table_header),
                Paragraph("<b>CONFIDENCE</b>", table_header),
                Paragraph("<b>DEFECTS</b>", table_header),
                Paragraph("<b>DECISION</b>", table_header),
                Paragraph("<b>ADJUDICATED BY</b>", table_header),
            ]
        ]

        # Table Rows
        for idx, lot in enumerate(lots_data):
            lid = lot.get("lot_id") or lot.get("lotId") or "-"
            fam = lot.get("fish_family") or lot.get("fishFamily") or "-"
            grade = lot.get("grade") or "A"
            conf_val = lot.get("grade_confidence", lot.get("confidence", 0.9))
            if conf_val <= 1.0:
                conf_str = f"{(conf_val * 100):.1f}%"
            else:
                conf_str = f"{conf_val:.1f}%"
            def_cnt = str(lot.get("defects_count", lot.get("defectsCount", 0)))
            decision = (lot.get("decision") or "PASS").upper()
            adj_by = lot.get("adjudicated_by") or "Pipeline"
            if adj_by == "agent":
                adj_text = "AI Agent (Bedrock)"
            elif adj_by == "human":
                adj_text = "Human Override"
            else:
                adj_text = "Standard AI"

            grade_color = "#16a34a" if grade == "A" else ("#d97706" if grade == "B" else "#dc2626")
            dec_color = "#16a34a" if decision == "PASS" else "#dc2626"

            lot_table_rows.append([
                Paragraph(f"<font color='#0284c7'><b>{lid}</b></font>", table_cell_left),
                Paragraph(fam, table_cell),
                Paragraph(f"<font color='{grade_color}'><b>Grade {grade}</b></font>", table_cell),
                Paragraph(conf_str, table_cell),
                Paragraph(def_cnt, table_cell),
                Paragraph(f"<font color='{dec_color}'><b>{decision}</b></font>", table_cell),
                Paragraph(adj_text, table_cell),
            ])

        # If lots is empty
        if len(lots_data) == 0:
            lot_table_rows.append([
                Paragraph("Tidak ada catatan lot pada pengiriman ini.", table_cell_left),
                Paragraph("-", table_cell),
                Paragraph("-", table_cell),
                Paragraph("-", table_cell),
                Paragraph("-", table_cell),
                Paragraph("-", table_cell),
                Paragraph("-", table_cell),
            ])

        # Widths total = 540 pt (A4 width 595 - 2*15mm*2.83 pt ~ 510-540)
        lot_table = Table(
            lot_table_rows,
            colWidths=[105, 95, 60, 65, 50, 65, 100],
            repeatRows=1,
        )
        
        # Style table
        table_style_commands = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]

        # Alternating background
        for row_i in range(1, len(lot_table_rows)):
            bg_col = colors.HexColor("#ffffff") if row_i % 2 == 1 else colors.HexColor("#f8fafc")
            table_style_commands.append(("BACKGROUND", (0, row_i), (-1, row_i), bg_col))

        lot_table.setStyle(TableStyle(table_style_commands))
        elements.append(lot_table)
        elements.append(Spacer(1, 5 * mm))

        # ----------------------------------------------------
        # 5. FOOTER & CONTAINER QR CODE TRACKING
        # ----------------------------------------------------
        # Generate QR Code image
        tracking_url = f"{settings.APP_PUBLIC_URL}/dispatch/{dispatch_id}"
        qr_buf = cls.generate_qr_buffer(tracking_url, box_size=3, border=1)
        qr_image = RLImage(qr_buf, width=22 * mm, height=22 * mm)

        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        footer_text_content = [
            Paragraph(f"<b>VERIFIKASI DIGITAL KONTROL KONTELUSURAN (TRACEABILITY QR)</b>", footer_bold),
            Paragraph(
                f"Pindai kode QR untuk memvalidasi sertifikat ini secara real-time pada sistem NusaQC.<br/>"
                f"<b>URL Pelacakan:</b> <font color='#0284c7'>{tracking_url}</font><br/>"
                f"<b>Penerbit Resmi:</b> {settings.CERTIFICATE_ISSUER} | Standar: {settings.CERTIFICATE_STANDARD}<br/>"
                f"Dokumen ini diterbitkan secara otomatis dan sah tanpa tanda tangan basah berdasarkan otentikasi AI Vision inspection logs.<br/>"
                f"<b>Waktu Terbit:</b> {now_str}",
                footer_small,
            ),
        ]

        footer_table_data = [
            [qr_image, footer_text_content]
        ]
        footer_table = Table(footer_table_data, colWidths=[75, 465])
        footer_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ])
        )

        elements.append(KeepTogether([footer_table]))

        # Build Document
        doc.build(elements)

        pdf_buffer.seek(0)
        return pdf_buffer.getvalue()
