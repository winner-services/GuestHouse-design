import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../config/MainContext";

function ApprovisionementForm({ hideForm }) {
    const [productData, setproductData] = useState([])
    const [supplierData, setsupplierData] = useState([])
    const [pourchase_form, setpourchase_form] = useState([]);
    const [accountData, setAccountData] = useState([]);

    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    const [base_form, setBaseForm] = useState({
        reference: "",
        paid_amount: 0,
        supplier_id: "",
        total_price: 0,
        purchase_date: today,
        account_id: "",
    })

    const [form, setForm] = useState({
        product_id: null,
        product_name: "",
        unite_price: 0,
        selling_price: 0,
        quantity: 0,
        total_price: 0,
        old_quantity: 0,
        unit: ""
    })

    const { setLoader } = useContext(MainContext);

    const submitData = async (e) => {
        e.preventDefault()

        let url = `createSupply`
        let method = 'POST'
        let generalForm = {}

        generalForm.achat = base_form;
        generalForm.achat.total_price = Object.values(pourchase_form).reduce((acc, item) => acc + (item["unite_price"] * item["quantity"]), 0);
        generalForm.achat_detail = pourchase_form;

        setLoader(true)
        try {

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(generalForm),
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Un approvisionnement a ete insere avec success", "Success");
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

    const getProductOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getProductOptions`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setproductData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const addLignBtn = () => {
        if (!form.product_id || !form.quantity || !form.unite_price) {
            toastr.error('Veillez ajouter un produit.', 'Erreur!');
            return;
        }

        const existingProduct = Object.values(pourchase_form).find(item => item.product_id === form.product_id);

        if (existingProduct) {
            toastr.error('La marchandise existe déjà', 'Erreur!');
        } else {
            console.log("FORM:", form)
            setpourchase_form((prevPourchaseForm) => [...prevPourchaseForm, { ...form, index: prevPourchaseForm.length }]);

            setForm({
                product_id: '',
                product_name: '',
                unite_price: 0,
                quantity: 0,
                purchase_date: today
            });

            // Calculate total price for each product
            Object.keys(pourchase_form).forEach(key => {
                pourchase_form[key].total_price = pourchase_form[key].unite_price * pourchase_form[key].quantity;
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

    const getAccountOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getAllAccounts`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setAccountData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    useEffect(() => {
        if (pourchase_form.length > 0) {
            setBaseForm((prevBaseForm) => ({
                ...prevBaseForm,
                paid_amount: Object.values(pourchase_form).reduce((acc, item) => acc + item.total_price, 0)
            }));
        }else{
            getSupplierOptions()
            getProductOptions()
            getAccountOptions()
        }
    }, [pourchase_form])

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
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="fname" className="form-label mb-8 h6">Date de transaction <span className="text-danger">*</span></label>
                                        <input type="date" className="form-control py-11" id="fname" value={base_form.purchase_date} onChange={(e) => { setBaseForm({ ...base_form, purchase_date: e.target.value }) }}
                                            placeholder="Entrer une date" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="address" className="form-label mb-8 h6">Reference</label>
                                        <input type="text" className="form-control py-11" id="address" value={base_form.reference} onChange={(e) => { setBaseForm({ ...base_form, reference: e.target.value }) }}
                                            placeholder="Entrer une reference" />
                                    </div>
                                    <div className="col-sm-4 col-xs-4">
                                        <label htmlFor="email" className="form-label mb-8 h6">Fournisseur <span className="text-danger">*</span></label>
                                        <select id="" value={base_form.supplier_id} onChange={(e) => { setBaseForm({ ...base_form, supplier_id: e.target.value }) }} className="form-control py-11">
                                            <option hidden>Selectionnez un fournisseur</option>
                                            {supplierData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-sm-4 col-xs-4">
                                        <label htmlFor="address" className="form-label mb-8 h6">Montant Payé</label>
                                        <input type="number" className="form-control py-11" id="address" value={base_form.paid_amount} onChange={(e) => { setBaseForm({ ...base_form, paid_amount: e.target.value }) }}
                                            placeholder="Entrer un montant payé" />
                                    </div>

                                    <div className="col-sm-4 col-xs-4 mb-8">
                                        <label htmlFor="email" className="form-label mb-8 h6">Compte <span className="text-danger">*</span></label>
                                        <select id="" value={base_form.account_id} onChange={(e) => { setBaseForm({ ...base_form, account_id: e.target.value }) }} className="form-control py-11">
                                            <option hidden>Selectionnez un compte</option>
                                            {accountData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.designation}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-sm-12" style={{ marginTop: 15 }}>
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th style={{ width: '40%' }}>Produit <span className="text-danger">*</span></th>
                                                        <th>Qté <span className="text-danger">*</span></th>
                                                        <th>Prix Achat <span className="text-danger">*</span></th>
                                                        <th>P.T</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">#</span></td>
                                                        <td>
                                                            <select id="" value={form.product_id} onChange={(e) => {
                                                                setForm({
                                                                    ...form,
                                                                    product_id: e.target.value,
                                                                    product_name: productData.find((item) => item.id == e.target.value).designation,
                                                                    unit: productData.find((item) => item.id == e.target.value).unite,
                                                                })
                                                            }} className="form-control" style={{ border: 'none' }}>
                                                                <option hidden>Produits</option>
                                                                {productData.map((item, index) => (
                                                                    <option value={item.id} key={index}>{item.designation}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input type="number" value={form.quantity} onChange={(e) => { setForm({ ...form, quantity: e.target.value }) }} className="form-control" placeholder="Cliquer ici" />
                                                        </td>
                                                        <td>
                                                            <input type="number" value={form.unite_price} onChange={(e) => { setForm({ ...form, unite_price: e.target.value }) }} className="form-control" placeholder="Cliquer ici" />
                                                        </td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{form.total_price = form.quantity * form.unite_price} $</span></td>
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
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.product_name}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity} {item.unit}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.unite_price} $</span></td>
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
                                                            <strong className="h6 mb-0 fw-bold text-gray-300">{Object.values(pourchase_form).reduce((acc, item) => acc + (item["unite_price"] * item["quantity"]), 0)} $</strong>
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

export default ApprovisionementForm