import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../config/MainContext";

function RestoSupplyForm({ hideForm, singleClient }) {
    const [productData, setproductData] = useState([])
    const [agentData, setagentData] = useState([])
    const [departementData, setdepartementData] = useState([])
    const [pourchase_form, setpourchase_form] = useState([]);
    const [brut_total_price, setbrut_total_price] = useState(0);

    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    const [base_form, setBaseForm] = useState({
        service_id: "",
        transaction_date: today,
        user_id:1
    })

    const [form, setForm] = useState({
        product_id: null,
        product_name: "",
        pourchased_price: 0,
        quantity: 0,
        old_quantity: 0,
        unit: "",
    })

    const { setLoader } = useContext(MainContext);

    const submitData = async (e) => {
        e.preventDefault()

        let url = `createOrderKitchen`
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
                toastr.success("Une commande a ete insere avec success", "Success");
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

    const getDepartementOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getServiceOptions`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setdepartementData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const addLignBtn = () => {
        if (!form.product_id || !form.quantity) {
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
                quantity: 0,
                transaction_date: today
            });

            // Calculate total price for each product
            Object.keys(pourchase_form).forEach(key => {
                pourchase_form[key].total_price = pourchase_form[key].unit_price * pourchase_form[key].quantity;
            });

            // Calculate total brut_total_price
            const sum = Object.values(pourchase_form).reduce((acc, item) => acc + item.total_price, 0);
            setbrut_total_price(sum);
            base_form.paid_amount = sum;
        }
    };

    const removeLignBtn = (model) => {
        setpourchase_form((prevPourchaseForm) => {
            const updatedPourchaseForm = [...prevPourchaseForm]; // Create a copy of the array
            delete updatedPourchaseForm[model.index];

            return updatedPourchaseForm.filter(item => item !== undefined);
        });

        // Calculate total brut_prix_total
        const sum = pourchase_form.reduce((acc, item) => acc + item.total_price, 0);
        setbrut_total_price(sum);
        base_form.paid_amount = sum;
    };

    useEffect(() => {
        getDepartementOptions()
        getProductOptions()
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
                        <li><a href="/main/restaurant-supply" className="text-gray-200 fw-normal text-15 hover-text-main-600">Restaurant</a>
                        </li>
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><span className="text-main-600 fw-normal text-15">Approvisionnements</span></li>
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
                            <h4 className="mb-4">Nouvel Approvisionnement</h4>
                        </div>
                        <div className="card-body">
                            <form action="#">
                                <div className="row gy-4">
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="fname" className="form-label mb-8 h6">Date de transaction</label>
                                        <input type="date" className="form-control py-11" id="fname" value={base_form.transaction_date} onChange={(e) => { setBaseForm({ ...base_form, transaction_date: e.target.value }) }}
                                            placeholder="Entrer une date" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="email" className="form-label mb-8 h6">Departement</label>
                                        <select id="" value={base_form.service_id} onChange={(e) => { setBaseForm({ ...base_form, service_id: e.target.value }) }} className="form-control py-11">
                                            <option hidden>Selectionnez un departement</option>
                                            {departementData.map((item, index) => (
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
                                                        <th style={{ width: '40%' }}>Produit</th>
                                                        <th>Quantité</th>
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
                                                                    unit_price: productData.find((item) => item.id == e.target.value).pourchased_price,
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
                                                                <td>
                                                                    <button type="button" className="btn btn-danger p-9" onClick={() => removeLignBtn(item)}>
                                                                        <i className="ph ph-trash text-white"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div class="col-12">
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

export default RestoSupplyForm