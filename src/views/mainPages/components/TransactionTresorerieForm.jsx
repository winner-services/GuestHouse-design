import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../config/MainContext";

function TransactionTresorerieForm({ hideForm, singleClient }) {
    const [form, setForm] = useState({
        transaction_date: "",
        amount: 1,
        phone: "",
        address: "",
        email: ""
    })

    const { setLoader } = useContext(MainContext);
    const [comptetData, setCompteData] = useState([])
    const [compteAccountData, setCompteAccountData] = useState([])

    const submitData = async (e) => {
        e.preventDefault()

        let url = `createClient`
        let method = 'POST'
        if (form.id) {
            url = `updateClient/${singleClient.id}`
            method = 'PUT'
            // insertUpdateFn(url, method, form)
        }

        setLoader(true)
        try {
            if (form.phone.charAt(0) != '+') {
                form.phone = [form.phone.slice(0, 0), "+", form.phone.slice(0)].join('');
            }

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(form),
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Un client a ete insere avec success", "Success");
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

    const getCompteOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getAllAccounts`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setCompteData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getCompteAccountOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getSpentCategoryOptions`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setCompteAccountData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    useEffect(() => {
        getCompteOptions()
        getCompteAccountOptions()
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
                        <li><span className="text-main-600 fw-normal text-15">Transaction Financieres</span></li>
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
                            <h4 className="mb-4">Nouvelle Transaction</h4>
                        </div>
                        <div className="card-body">
                            <form action="#">
                                <div className="row gy-4">
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="fname" className="form-label mb-8 h6">Date transaction</label>
                                        <input type="date" className="form-control py-11" id="fname" value={form.transaction_date} onChange={(e) => { setForm({ ...form, transaction_date: e.target.value }) }}
                                            placeholder="Entrer une date" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="address" className="form-label mb-8 h6">Montant</label>
                                        <input type="number" className="form-control py-11" id="address" value={form.amount} onChange={(e) => { setForm({ ...form, amount: e.target.value }) }}
                                            placeholder="Entrer un montant" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="email" className="form-label mb-8 h6">Motif</label>
                                        <input type="text" className="form-control py-11" id="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }) }}
                                            placeholder="Entrer un motif" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="lname" className="form-label mb-8 h6 me-1">Compte de tresorerie</label>
                                        <select className="form-control py-11" value={form.unit_id} onChange={(e) => { setForm({ ...form, unit_id: e.target.value }) }}>
                                            <option hidden>Selectionner une option</option>
                                            {comptetData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.designation}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="lname" className="form-label mb-8 h6 me-1">Compte comptables</label>
                                        <select className="form-control py-11" value={form.unit_id} onChange={(e) => { setForm({ ...form, unit_id: e.target.value }) }}>
                                            <option hidden>Selectionner une option</option>
                                            {compteAccountData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.designation}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="lname" className="form-label mb-8 h6 me-1">Type de transaction</label>
                                        <select className="form-control py-11" value={form.unit_id} onChange={(e) => { setForm({ ...form, unit_id: e.target.value }) }}>
                                            <option hidden>Selectionner une option</option>
                                            <option value="Recette">Recette</option>
                                            <option value="Depense">Depense</option>
                                            
                                        </select>
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

export default TransactionTresorerieForm