import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../config/MainContext";
import Modal from 'react-bootstrap/Modal';

function ProductForm({ hideForm, singleProduct }) {
    const [form, setForm] = useState({
        designation: "",
        unit_id: "",
        category_id: "",
        quantity: 0,
        minimum_quantity: 0,
        purchase_price: 0,
        selling_price: 0,
        image: ""
    })
    const [unitForm, setUnitForm] = useState({
        designation: "",
        description:""
    })

    const { setLoader } = useContext(MainContext);
    const [categoryData, setCategoryData] = useState([])
    const [unitData, setUnitData] = useState([])
    const [modalVisible, setModalVisible] = useState(false);
    const [unitFormVisible, setUnitFormVisible] = useState(false)
    const [showPreview, setShowPreview] = useState();
    const [imagePreview, setImagePreview] = useState();

    const getCategoryOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getProductCategoryOptions`, {
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

    const getUnitOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getUnitOptions`, {
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
        setUnitFormVisible(false)
        unitForm.designation = ""
        unitForm.description = ""
    }

    const showUnitModal = () => {
        setUnitFormVisible(true)
        setModalVisible(true)
    }

    const showCategModal = () => {
        setUnitFormVisible(false)
        setModalVisible(true)
    }

    const onFileChange = (event) => {
        form.image = event.target.files[0];

        let reader = new FileReader();
        reader.addEventListener(
            "load",
            function () {
                setShowPreview(true)
                setImagePreview(reader.result);
            }.bind(showPreview, imagePreview),
            false
        );
        if (form.image) {
            if (/\.(jpe?g|png|jpg)$/i.test(form.image.name)) {
                console.log("exist");
                reader.readAsDataURL(form.image);
            } else {
                toastr.error(
                    "Veillez inserer une photo du type png, jpeg et jpg",
                    "Erreur"
                );
                return;
            }
        }
    };

    const submitData = async (e) => {
        e.preventDefault()
        let url = `createProduct`
        let method = 'POST'
        let submit_form = form
        
        if (form.id) {
            url = `updateProductCategory/${form.id}`
            method = 'PUT'
        } else if (modalVisible && unitFormVisible) {
            url = `createUnit`
            method = 'POST'
            submit_form = unitForm
        } else if (modalVisible && (unitFormVisible == false)) {
            url = `createProductCategory`
            method = 'POST'
            submit_form = unitForm
        }
        
        const formData = new FormData();
        formData.append('designation', form.designation);
        formData.append('unit_id', form.unit_id);
        formData.append('category_id', form.category_id);
        formData.append('quantity', form.quantity);
        formData.append('minimum_quantity', form.minimum_quantity);
        formData.append('purchase_price', form.purchase_price);
        formData.append('selling_price', form.selling_price);
        formData.append('image', form.image);
        
        setLoader(true)
        try {

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: modalVisible?headerRequest:{"Authorization": `Bearer ${localStorage.getItem('token')}`},
                body: modalVisible?JSON.stringify(submit_form):formData,
            });
            const res = await response.json();
            if (res) {
                if (res.success) {
                    if (modalVisible && unitFormVisible) {
                        toastr.success(res.message, "Success");
                        getUnitOptions()
                        hideModal()
                    } else if (modalVisible && (unitFormVisible == false)) {
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
        getUnitOptions()
        if (Object.values(singleProduct).length > 0) {
            console.log(singleProduct)
            for (const key in singleProduct) {
                if (Object.hasOwnProperty.call(form, key)) {
                    const element = singleProduct[key];
                    form[key] = element;
                    setForm({ ...form, [key]: element })
                }
            }
            setForm({ ...form, id: singleProduct.id })
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
                        <li><span className="text-main-600 fw-normal text-15">Produits</span></li>
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
                    aria-labelledby="pills-details-tab" tabIndex="0">
                    <div className="card mt-24">
                        <div className="card-header border-bottom">
                            <h4 className="mb-4">{form.id?"Modification du":"Nouveau"} Produit</h4>
                        </div>
                        <div className="card-body">
                            <form action="#">
                                <div className="row gy-4">
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="fname" className="form-label mb-8 h6">Designation <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control py-11" id="fname" value={form.designation} onChange={(e) => { setForm({ ...form, designation: e.target.value }) }}
                                            placeholder="Entrer le designation" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="lname" className="form-label mb-8 h6 me-1">Categorie <span className="text-danger">*</span></label><button type="button" className="btn btn-secondary rounded-pill py-2" onClick={() => showCategModal()}>Ajouter +</button>
                                        <select className="form-control py-11" value={form.category_id} onChange={(e) => { setForm({ ...form, category_id: e.target.value }) }}>
                                            <option hidden>Selectionner une option</option>
                                            {categoryData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.designation}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="lname" className="form-label mb-8 h6 me-1">Unité <span className="text-danger">*</span></label><button type="button" className="btn btn-secondary rounded-pill py-2" onClick={() => showUnitModal()}>Ajouter +</button>
                                        <select className="form-control py-11" value={form.unit_id} onChange={(e) => { setForm({ ...form, unit_id: e.target.value }) }}>
                                            <option hidden>Selectionner une option</option>
                                            {unitData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.description} | {item.designation}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="address" className="form-label mb-8 h6">Quantité en stock</label>
                                        <input type="number" className="form-control py-11" id="address" value={form.quantity} onChange={(e) => { setForm({ ...form, quantity: e.target.value }) }}
                                            placeholder="Entrer une Quantité" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="address" className="form-label mb-8 h6">Quantité minimale</label>
                                        <input type="number" className="form-control py-11" id="address" value={form.minimum_quantity} onChange={(e) => { setForm({ ...form, minimum_quantity: e.target.value }) }}
                                            placeholder="Entrer une Quantité minimale" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="address" className="form-label mb-8 h6">Prix d'achat <span className="text-danger">*</span></label>
                                        <input type="number" className="form-control py-11" id="address" value={form.purchase_price} onChange={(e) => { setForm({ ...form, purchase_price: e.target.value }) }}
                                            placeholder="Entrer un Prix d'achat" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="address" className="form-label mb-8 h6">Prix de vente <span className="text-danger">*</span></label>
                                        <input type="number" className="form-control py-11" id="address" value={form.selling_price} onChange={(e) => { setForm({ ...form, selling_price: e.target.value }) }}
                                            placeholder="Entrer un Prix de vente" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="address" className="form-label mb-8 h6">Image du produit</label>
                                        <input type="file" className="form-control py-11" id="address" onChange={onFileChange}
                                            placeholder="Entrer une image" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        {imagePreview ?
                                            <img
                                                src={imagePreview}
                                                class="profile-user-img img-fluid img-circle"
                                                alt="User profile picture"
                                                style={{ width: '100%' }}
                                            /> : ''
                                        }
                                    </div>

                                    <div class="col-12">
                                        <div className="flex-align justify-content-end gap-8">
                                            <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideForm}>Annuler</button>
                                            <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>{form.id?"Modifier":"Enregistrer"}</button>
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
                <Modal.Title>{unitFormVisible ? "Nouvelle Unité" : "Nouvelle Categorie"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="col-sm-12 col-xs-12">
                    <label htmlFor="address" className="form-label mb-8 h6">{unitFormVisible?"Abréviation":"Designation"}</label>
                    <input type="text" className="form-control py-11" id="address" value={unitForm.designation} onChange={(e) => { setUnitForm({ ...unitForm, designation: e.target.value }) }}
                        placeholder={unitFormVisible?"Ajouter une abréviation":"Ajouter une designation"} />
                </div>
                <div className="col-sm-12 col-xs-12">
                    <label htmlFor="address" className="form-label mb-8 h6">{unitFormVisible?"Designation":"Description"}</label>
                    <input type="text" className="form-control py-11" id="address" value={unitForm.description} onChange={(e) => { setUnitForm({ ...unitForm, description: e.target.value }) }}
                        placeholder={unitFormVisible?"Entrer une Designation":"Entrer une Description"} />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideModal}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
            </Modal.Footer>
        </Modal>
    </>
}

export default ProductForm