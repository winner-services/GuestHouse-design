import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../config/MainContext";
import Modal from 'react-bootstrap/Modal';

function ChambreForm({ hideForm, singleClient }) {
    const [form, setForm] = useState({
        designation: "",
        level_id: "",
        category_id: "",
        unite_price: 0,
    })
    const [unitForm, setUnitForm] = useState({
        designation: ""
    })

    const { setLoader } = useContext(MainContext);
    const [categoryData, setCategoryData] = useState([])
    const [unitData, setUnitData] = useState([])
    const [modalVisible, setModalVisible] = useState(false);
    const [niveauFormVisible, setniveauFormVisible] = useState(false)

    const getCategoryOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getRoomCategoryOptions`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setCategoryData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getLevelOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getRoomLevelOptions`, {
                method: 'GET',  
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setUnitData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const hideModal = () => {
        setModalVisible(false)
        setniveauFormVisible(false)
        unitForm.designation = ""
    }

    const showCategModal = () => {
        setniveauFormVisible(false)
        setModalVisible(true)
    }

    const showUnitModal = () => {
        setniveauFormVisible(true)
        setModalVisible(true)
    }

    const submitData = async (e) => {
        e.preventDefault()

        let url = `createRoom`
        let method = 'POST'
        let submit_form = form
        
        if (form.id) {
            url = `updateRoom/${form.id}`
            method = 'PUT'
        } else if (modalVisible && niveauFormVisible) {
            url = `createLevel`
            method = 'POST'
            submit_form = unitForm
        } else if (modalVisible && (niveauFormVisible == false)) {
            url = `createRoomCategory`
            method = 'POST'
            submit_form = unitForm
        }

        setLoader(true)
        try {

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(submit_form),
            });
            const res = await response.json();
            if (res) {
                if (res.success) {
                    if (modalVisible && niveauFormVisible) {
                        toastr.success(res.message, "Success");
                        getLevelOptions()
                        hideModal()
                    } else if (modalVisible && (niveauFormVisible == false)) {
                        toastr.success(res.message, "Success");
                        getCategoryOptions()
                        hideModal()
                    } else {
                        toastr.success(res.message, "Success");
                        hideForm(false)
                    }
                } else {
                    toastr.error(res.message, "Erreur");
                    console.log(res)
                    // window.location.reload()
                }
            }
            setLoader(false)
        } catch (error) {
            toastr.error("Veillez reessayez", "Erreur");
            console.error(error);
            setLoader(false)
        }
    }

    useEffect(() => {
        getCategoryOptions()
        getLevelOptions()
        if (Object.values(singleClient).length > 0) {
            console.log(singleClient)
            for (const key in singleClient) {
                if (Object.hasOwnProperty.call(form, key)) {
                    const element = singleClient[key];
                    form[key] = element;
                    setForm({ ...form, [key]: element })
                }
            }
            setForm({ ...form, id: singleClient.id })
        }
    }, [])

    return <>
        <div className="dashboard-body">
            {/* Breadcrumb Start */}
            <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                {/* Breadcrumb Start */}
                <div className="breadcrumb mb-24">
                    <ul className="flex-align gap-4">
                        <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a>
                        </li>
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><span className="text-main-600 fw-normal text-15">Chambres</span></li>
                    </ul>
                </div>
                {/* Breadcrumb End */}

                {/* Breadcrumb Right Start */}
                <div className="flex-align gap-8 flex-wrap">
                    <div
                        className="flex-align text-gray-500 text-13 border border-gray-100 rounded-4 ">
                        <button className="btn btn-primary" onClick={hideForm}>Retour</button>
                    </div>
                </div>
                {/* Breadcrumb Right End */}
            </div>
            {/* Breadcrumb End */}

            <div className="tab-content" id="pills-tabContent">
                {/* My Details Tab start */}
                <div className="tab-pane fade show active" id="pills-details" role="tabpanel"
                    aria-labelledby="pills-details-tab" tabindex="0">
                    <div className="card mt-24">
                        <div className="card-header border-bottom">
                            <h4 className="mb-4">{form.id?'Modifier une ':'Nouvelle '} chambre</h4>
                        </div>
                        <div className="card-body">
                            <form action="#">
                                <div className="row gy-4">
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="fname" className="form-label mb-8 h6">Designation</label>
                                        <input type="text" className="form-control py-11" id="fname" value={form.designation} onChange={(e) => { setForm({ ...form, designation: e.target.value }) }}
                                            placeholder="Entrer la designation" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="lname" className="form-label mb-8 h6 me-1">Categorie</label><button type="button" className="btn btn-secondary rounded-pill py-2" onClick={() => showCategModal()}>Ajouter +</button>
                                        <select className="form-control py-11" value={form.category_id} onChange={(e) => { setForm({ ...form, category_id: e.target.value }) }}>
                                            <option hidden>Selectionner une option</option>
                                            {categoryData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.designation}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="address" className="form-label mb-8 h6">Prix Nuité</label>
                                        <input type="number" className="form-control py-11" id="address" value={form.unite_price} onChange={(e) => { setForm({ ...form, unite_price: e.target.value }) }}
                                            placeholder="Entrer un Prix Nuité" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="lname" className="form-label mb-8 h6 me-1">Niveau</label><button type="button" className="btn btn-secondary rounded-pill py-2" onClick={() => showUnitModal()}>Ajouter +</button>
                                        <select className="form-control py-11" value={form.level_id} onChange={(e) => { setForm({ ...form, level_id: e.target.value }) }}>
                                            <option hidden>Selectionner une option</option>
                                            {unitData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.designation}</option>
                                            ))}
                                        </select>
                                    </div>  

                                    <div class="col-12">
                                        <div className="flex-align justify-content-end gap-8">
                                            <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideForm}>Annuler</button>
                                            <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>{form.id?'Modifier':'Enregistrer'}</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                {/* My Details Tab End */}
            </div>
        </div>

        <Modal show={modalVisible} onHide={hideModal} size="sm" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{niveauFormVisible ? "Nouveau niveau" : "Nouvelle Categorie"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="col-sm-12 col-xs-12">
                    <label for="address" className="form-label mb-8 h6">Designation</label>
                    <input type="text" className="form-control py-11" id="address" value={unitForm.designation} onChange={(e) => { setUnitForm({ ...unitForm, designation: e.target.value }) }}
                        placeholder="Entrer une designation" />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideModal}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
            </Modal.Footer>
        </Modal>
    </>
}

export default ChambreForm