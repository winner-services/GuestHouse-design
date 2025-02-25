import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../config/MainContext";

function FournitureApprovisionementForm({ hideForm }) {
    const [fournitureData, setfournitureData] = useState([])
    const [agentData, setagentData] = useState([])
    const [pourchase_form, setpourchase_form] = useState([]);
    const [supplierData, setsupplierData] = useState([])

    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    const [base_form, setBaseForm] = useState({
        agent_id: "",
        total_price: 0,
        compte_id: "",
        supplier_id: "",
        order_date: today,
    })

    const [form, setForm] = useState({
        supplies_id: null,
        fourniture_name: "",
        unit_price: 0,
        selling_price: 0,
        quantity: 0,
        total_price: 0,
    })

    const { setLoader } = useContext(MainContext);

    const submitData = async (e) => {
        e.preventDefault()

        let url = `createCommandeFourniture`
        let method = 'POST'
        let generalForm = {}

        generalForm.order = base_form;
        generalForm.orderDetail = pourchase_form;

        setLoader(true)
        try {

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(generalForm),
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Une fourniture a ete insere avec success", "Success");
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

    const getAgentOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getUserOptions`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setagentData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getFournitureOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getFournitureOptions`, {
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

    const addLignBtn = () => {
        if (!form.supplies_id || !form.quantity || !form.unit_price) {
            toastr.error('Veillez ajouter une fourniture.', 'Erreur!');
            return;
        }

        const existingProduct = Object.values(pourchase_form).find(item => item.supplies_id === form.supplies_id);

        if (existingProduct) {
            toastr.error('La fourniture existe déjà', 'Erreur!');
        } else {
            console.log("FORM:", form)
            setpourchase_form((prevPourchaseForm) => [...prevPourchaseForm, { ...form, index: prevPourchaseForm.length }]);

            setForm({
                supplies_id: '',
                fourniture_name: '',
                unit_price: 0,
                quantity: 0,
                order_date: today
            });

            // Calculate total price for each product
            Object.keys(pourchase_form).forEach(key => {
                pourchase_form[key].total_price = pourchase_form[key].unit_price * pourchase_form[key].quantity;
            });

        }
    };

    const removeLignBtn = (model) => {
        setpourchase_form((prevPourchaseForm) => {
            const updatedPourchaseForm = [...prevPourchaseForm]; // Create a copy of the array
            delete updatedPourchaseForm[model.index];

            return updatedPourchaseForm.filter(item => item !== undefined);
        });
    };

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
        getAgentOptions()
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
                        <li><span className="text-main-600 fw-normal text-15">Approvisionnements    </span></li>
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
                            <h4 className="mb-4">Nouvel approvisionnement</h4>
                        </div>
                        <div className="card-body">
                            <form action="#">
                                <div className="row gy-4">
                                    <div className="col-sm-4 col-xs-6">
                                        <label htmlFor="fname" className="form-label mb-8 h6">Date de transaction <span className="text-danger">*</span></label>
                                        <input type="date" className="form-control py-11" id="fname" value={base_form.order_date} onChange={(e) => { setBaseForm({ ...base_form, order_date: e.target.value }) }}
                                            placeholder="Entrer une date" />
                                    </div>
                                    <div className="col-sm-4 col-xs-6">
                                        <label htmlFor="email" className="form-label mb-8 h6">Agent <span className="text-danger">*</span></label>
                                        <select id="" value={base_form.agent_id} onChange={(e) => { setBaseForm({ ...base_form, agent_id: e.target.value }) }} className="form-control py-11">
                                            <option hidden>Selectionnez un agent</option>
                                            {agentData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-sm-4 col-xs-6">
                                        <label htmlFor="email" className="form-label mb-8 h6">Fournisseur</label>
                                        <select id="" value={base_form.supplier_id} onChange={(e) => { setBaseForm({ ...base_form, supplier_id: e.target.value }) }} className="form-control py-11">
                                            <option hidden>Selectionnez un fournisseur</option>
                                            {supplierData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-sm-12" style={{ marginTop: 15 }}>
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th style={{ width: '40%' }}>Fourniture <span className="text-danger">*</span></th>
                                                        <th>Qté <span className="text-danger">*</span></th>
                                                        <th>Prix Unitaire <span className="text-danger">*</span></th>
                                                        <th>P.T</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">#</span></td>
                                                        <td>
                                                            <select id="" value={form.supplies_id} onChange={(e) => {
                                                                setForm({
                                                                    ...form,
                                                                    supplies_id: e.target.value,
                                                                    fourniture_name: fournitureData.find((item) => item.id == e.target.value).designation,
                                                                    unit_price: fournitureData.find((item) => item.id == e.target.value).value,
                                                                })
                                                            }} className="form-control" style={{ border: 'none' }}>
                                                                <option hidden>Fournitures</option>
                                                                {fournitureData.map((item, index) => (
                                                                    <option value={item.id} key={index}>{item.designation}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input type="number" value={form.quantity} onChange={(e) => { setForm({ ...form, quantity: e.target.value }) }} className="form-control" placeholder="Cliquer ici" />
                                                        </td>
                                                        <td>
                                                            <input type="number" value={form.unit_price} onChange={(e) => { setForm({ ...form, unit_price: e.target.value }) }} className="form-control" placeholder="Cliquer ici" />
                                                        </td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{form.total_price = form.quantity * form.unit_price} $</span></td>
                                                        <td>
                                                            <button type="button" className="btn btn-main p-9" onClick={() => addLignBtn()}>
                                                                <i className="ph ph-plus text-white"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {
                                                        pourchase_form.map((item, index) => (
                                                            <tr key={index}>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.fourniture_name}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.unit_price} $</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.total_price} $</span></td>
                                                                <td>
                                                                    <button type="button" className="btn btn-danger p-9" onClick={() => removeLignBtn(item)}>
                                                                        <i className="ph ph-trash text-white"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                    <tr>
                                                        <td colSpan={4}>
                                                            <strong className="h6 mb-0 text-gray-300 d-flex justify-content-center">TOTAL</strong>
                                                        </td>
                                                        <td>
                                                            <strong className="h6 mb-0 fw-bold text-gray-300">{Object.values(pourchase_form).reduce((acc, item) => acc + (item["unit_price"] * item["quantity"]), 0)} $</strong>
                                                        </td>
                                                        <td></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="flex-align justify-content-end gap-8">
                                            <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideForm}>Annuler</button>
                                            <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
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

export default FournitureApprovisionementForm