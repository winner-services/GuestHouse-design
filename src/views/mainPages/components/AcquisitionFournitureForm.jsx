import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../config/MainContext";

function AcquisitionFournitureForm({ hideForm }) {
    const [fournitureData, setfournitureData] = useState([])
    const [supplierData, setsupplierData] = useState([])
    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    const [form, setForm] = useState({
        transaction_date:today,
        detail_order_id: "",
        quantity: 0,
        unit_price: 0,
        supplier_id: "",
        reference:""
    })

    const { setLoader } = useContext(MainContext);

    const submitData = async (e) => {
        e.preventDefault()

        let url = `createAcquisitionSupplies`
        let method = 'POST'

        setLoader(true)
        try {

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(form),
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Une acquisition a ete insere avec success", "Success");
                hideForm(false)
                Object.keys(form).forEach(function (key, index) {
                    delete form[key];
                });
                setLoader(false)
            } else {
                toastr.error("Veillez reessayez", "Erreur");
                console.log(res)
                setLoader(false)
                // window.location.reload()
            }
        } catch (error) {
            toastr.error("Veillez reessayez", "Erreur");
            console.error(error);
            setLoader(false)
        }
    }

    const getFournitureOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getFournitureValidesData`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setfournitureData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getSupplierOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getSupplierOptions`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setsupplierData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    useEffect(() => {
        getFournitureOptions()
        getSupplierOptions()
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
                        <li><span className="text-main-600 fw-normal text-15">Acquisition des fournitures</span></li>
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
                            <h4 className="mb-4">{form.id ? "Modification du" : "Nouvelle"} Acquisition</h4>
                        </div>
                        <div className="card-body">
                            <form action="#">
                                <div className="row gy-4">
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="transaction_date" className="form-label mb-8 h6">Date transaction <span className="text-danger">*</span></label>
                                        <input type="date" className="form-control py-11" id="transaction_date" value={form.transaction_date} onChange={(e) => { setForm({ ...form, transaction_date: e.target.value }) }}
                                            placeholder="Entrer la date de transaction" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="part_number" className="form-label mb-8 h6">Reference <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control py-11" id="part_number" value={form.reference} onChange={(e) => { setForm({ ...form, reference: e.target.value }) }}
                                            placeholder="Entrer le numero de reference" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="lname" className="form-label mb-8 h6">Fourniture <span className="text-danger">*</span></label>
                                        <select id="" value={form.order_supplies_id} onChange={(e) => {
                                            setForm({
                                                ...form,
                                                fourniture_id: e.target.value,
                                                quantity: fournitureData.find((item) => item.id == e.target.value).quantity,
                                                unit_price: fournitureData.find((item) => item.id == e.target.value).unit_price,
                                                detail_order_id: fournitureData.find((item) => item.id == e.target.value).order_supplies_id,
                                            })
                                        }} className="form-control">
                                            <option hidden>Fournitures</option>
                                            {fournitureData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.fournitures}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="address" className="form-label mb-8 h6">Quantité <span className="text-danger">*</span></label>
                                        <input type="number" className="form-control py-11" id="address" value={form.quantity} onChange={(e) => { setForm({ ...form, quantity: e.target.value }) }}
                                            placeholder="Entrer une quantité" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="email" className="form-label mb-8 h6">Prix Unitaire</label>
                                        <input type="number" className="form-control py-11" id="email" value={form.unit_price} onChange={(e) => { setForm({ ...form, unit_price: e.target.value }) }}
                                            placeholder="Entrer un prix unitaire" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="Piece" className="form-label mb-8 h6">Fournisseur</label>
                                        <select id="" value={form.supplier_id} onChange={(e) => { setForm({ ...form, supplier_id: e.target.value }) }} className="form-control py-11">
                                            <option hidden>Selectionnez un fournisseur</option>
                                            {supplierData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-12">
                                        <div className="flex-align justify-content-end gap-8">
                                            <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideForm}>Annuler</button>
                                            <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>{form.id ? "Modifier" : "Enregistrer"}</button>
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
    </>
}

export default AcquisitionFournitureForm