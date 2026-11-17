"""Template routes - predefined and user-created analysis templates."""
import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User, AnalysisTemplate
from app.models.schemas import TemplateCreate, TemplateResponse
from app.services.auth_service import get_current_user

router = APIRouter()

# Built-in system templates for common ECU analysis scenarios
SYSTEM_TEMPLATES = [
    {
        "name": "Rolanti Analizi",
        "description": "Motor rolanti durumunda temel parametreler",
        "category": "engine",
        "config": json.dumps({
            "channels": [
                {"name": "Eng_nAvrUW", "label": "Motor Devir", "color": "#2196F3", "yAxis": 0},
                {"name": "Eng_qFuelMainUW", "label": "Ana Yakit Miktari", "color": "#FF9800", "yAxis": 1},
                {"name": "EISGov_qFuelUW", "label": "Rolanti Governor Yakit", "color": "#4CAF50", "yAxis": 1},
                {"name": "EISGov_nSetPointUW", "label": "Hedef Devir", "color": "#F44336", "yAxis": 0},
            ],
            "layout": {"title": "Rolanti Analizi", "yAxes": ["RPM", "mm3/str"]},
        }),
    },
    {
        "name": "Yakit Sistemi",
        "description": "Yakit enjeksiyon sistemi detaylari",
        "category": "injection",
        "config": json.dumps({
            "channels": [
                {"name": "Eng_qFuelMainUW", "label": "Ana Enjeksiyon", "color": "#2196F3", "yAxis": 0},
                {"name": "Eng_qFuelPilot1UW", "label": "Pilot 1", "color": "#FF9800", "yAxis": 0},
                {"name": "Eng_qFuelPilot2UW", "label": "Pilot 2", "color": "#4CAF50", "yAxis": 0},
                {"name": "Eng_qFuelPost1UW", "label": "Post 1", "color": "#9C27B0", "yAxis": 0},
                {"name": "Eng_dmFuelUW", "label": "Yakit Tuketimi", "color": "#F44336", "yAxis": 1},
            ],
            "layout": {"title": "Yakit Sistemi", "yAxes": ["mm3/str", "kg/h"]},
        }),
    },
    {
        "name": "Rail Basinc Kontrolu",
        "description": "Common-rail basinc kontrol sistemi",
        "category": "rail",
        "config": json.dumps({
            "channels": [
                {"name": "Rail_pSetPointOutUW", "label": "Hedef Basinc", "color": "#2196F3", "yAxis": 0},
                {"name": "RPSCD_pPeakUW", "label": "Gercek Basinc", "color": "#F44336", "yAxis": 0},
                {"name": "Rail_dvoMeUnCtlUW", "label": "Kontrol Cikisi", "color": "#4CAF50", "yAxis": 1},
                {"name": "MeUn_iActFltUW", "label": "Olcu Birimi Akimi", "color": "#FF9800", "yAxis": 1},
            ],
            "layout": {"title": "Rail Basinc Kontrolu", "yAxes": ["MPa", "mA"]},
        }),
    },
    {
        "name": "Sicakliklar",
        "description": "Tum motor sicaklik sensorlderi",
        "category": "temperature",
        "config": json.dumps({
            "channels": [
                {"name": "CTSCD_tFltUW", "label": "Sogutucu Suyu", "color": "#F44336", "yAxis": 0},
                {"name": "OTSCD_tUW", "label": "Motor Yagi", "color": "#FF9800", "yAxis": 0},
                {"name": "IATSCD_tUW", "label": "Emme Havasi", "color": "#2196F3", "yAxis": 0},
                {"name": "ETSCD_tUW", "label": "Egzoz", "color": "#9C27B0", "yAxis": 0},
                {"name": "FTSCD_tUW", "label": "Yakit", "color": "#4CAF50", "yAxis": 0},
            ],
            "layout": {"title": "Sicakliklar", "yAxes": ["C"]},
        }),
    },
    {
        "name": "Enjeksiyon Zamanlama",
        "description": "Enjeksiyon acisal zamanlama (timing)",
        "category": "injection",
        "config": json.dumps({
            "channels": [
                {"name": "InjCrv_phiMIDesW", "label": "Ana Enj. Acisi", "color": "#2196F3", "yAxis": 0},
                {"name": "InjCrv_phiPiI1DesW", "label": "Pilot 1 Acisi", "color": "#FF9800", "yAxis": 0},
                {"name": "InjCrv_phiPiI2DesW", "label": "Pilot 2 Acisi", "color": "#4CAF50", "yAxis": 0},
                {"name": "InjCrv_phiPoI1DesW", "label": "Post 1 Acisi", "color": "#9C27B0", "yAxis": 0},
                {"name": "InjCrv_phiPoI2DesW", "label": "Post 2 Acisi", "color": "#F44336", "yAxis": 0},
            ],
            "layout": {"title": "Enjeksiyon Zamanlama", "yAxes": ["KMA"]},
        }),
    },
    {
        "name": "Motor Koruma",
        "description": "Motor koruma limitleri ve durumlar",
        "category": "protection",
        "config": json.dumps({
            "channels": [
                {"name": "Eng_qFuelSetUW", "label": "Yakit Set", "color": "#2196F3", "yAxis": 0},
                {"name": "EngPrt_qFuelSpdLimUW", "label": "Hiz Limiti", "color": "#F44336", "yAxis": 0},
                {"name": "EngPrt_qFuelTrbLimUW", "label": "Turbo Limiti", "color": "#FF9800", "yAxis": 0},
                {"name": "EngPrt_qFuelOvhtLimUW", "label": "Asinma Limiti", "color": "#9C27B0", "yAxis": 0},
                {"name": "EngLim_qMaxUW", "label": "Max Limit", "color": "#4CAF50", "yAxis": 0},
            ],
            "layout": {"title": "Motor Koruma Limitleri", "yAxes": ["mm3/str"]},
        }),
    },
    {
        "name": "Gaz Pedali ve Hiz",
        "description": "Gaz pedali pozisyonu ve arac hizi",
        "category": "vehicle",
        "config": json.dumps({
            "channels": [
                {"name": "AccPedCD_rFltUW", "label": "Gaz Pedali", "color": "#2196F3", "yAxis": 0},
                {"name": "VSSCD_vUW", "label": "Arac Hizi", "color": "#4CAF50", "yAxis": 1},
                {"name": "Eng_nAvrUW", "label": "Motor Devir", "color": "#F44336", "yAxis": 2},
            ],
            "layout": {"title": "Gaz Pedali ve Hiz", "yAxes": ["%", "km/h", "RPM"]},
        }),
    },
    {
        "name": "Basinc Sensorleri",
        "description": "Tum basinc sensorlderi",
        "category": "pressure",
        "config": json.dumps({
            "channels": [
                {"name": "OPSCD_pUW", "label": "Yag Basinci", "color": "#FF9800", "yAxis": 0},
                {"name": "APSCD_pUW", "label": "Emme Basinci", "color": "#2196F3", "yAxis": 0},
                {"name": "BPSCD_pUW", "label": "Boost Basinci", "color": "#4CAF50", "yAxis": 0},
            ],
            "layout": {"title": "Basinc Sensorleri", "yAxes": ["kPa"]},
        }),
    },
]


@router.get("/", response_model=List[TemplateResponse])
def list_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all templates (system + user's own)."""
    templates = (
        db.query(AnalysisTemplate)
        .filter(
            (AnalysisTemplate.is_system == True)
            | (AnalysisTemplate.owner_id == current_user.id)
        )
        .order_by(AnalysisTemplate.is_system.desc(), AnalysisTemplate.name)
        .all()
    )

    # Seed system templates if they don't exist
    if not any(t.is_system for t in templates):
        for tpl in SYSTEM_TEMPLATES:
            db_tpl = AnalysisTemplate(
                name=tpl["name"],
                description=tpl["description"],
                category=tpl["category"],
                is_system=True,
                config=tpl["config"],
                owner_id=None,
            )
            db.add(db_tpl)
        db.commit()
        templates = (
            db.query(AnalysisTemplate)
            .filter(
                (AnalysisTemplate.is_system == True)
                | (AnalysisTemplate.owner_id == current_user.id)
            )
            .order_by(AnalysisTemplate.is_system.desc(), AnalysisTemplate.name)
            .all()
        )

    return [TemplateResponse.model_validate(t) for t in templates]


@router.post("/", response_model=TemplateResponse)
def create_template(
    template: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a custom analysis template."""
    # Validate JSON config
    try:
        json.loads(template.config)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Gecersiz JSON konfigurasyonu")

    db_tpl = AnalysisTemplate(
        name=template.name,
        description=template.description,
        category=template.category,
        is_system=False,
        config=template.config,
        owner_id=current_user.id,
    )
    db.add(db_tpl)
    db.commit()
    db.refresh(db_tpl)
    return TemplateResponse.model_validate(db_tpl)


@router.delete("/{template_id}")
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a user template (system templates cannot be deleted)."""
    template = db.query(AnalysisTemplate).filter(AnalysisTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Sablon bulunamadi")
    if template.is_system:
        raise HTTPException(status_code=403, detail="Sistem sablonlari silinemez")
    if template.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu sablonu silme yetkiniz yok")

    db.delete(template)
    db.commit()
    return {"message": "Sablon basariyla silindi"}
