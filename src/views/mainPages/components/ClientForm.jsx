import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../config/MainContext";
import PhoneInput from 'react-phone-input-2'

function ClientForm({ hideForm, singleClient }) {
    const [form, setForm] = useState({
        name: "",
        gender: "",
        phone: "",
        address: "",
        email: ""
    })

    const { setLoader } = useContext(MainContext);

    const submitData = async (e) => {
        e.preventDefault()

        let url = `createCustomer`
        let method = 'POST'
        if (form.id) {
            url = `updateCustomer/${form.id}`
            method = 'PUT'
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

    useEffect(() => {
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
                        <li><span className="text-main-600 fw-normal text-15">Clients</span></li>
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
                            <h4 className="mb-4">{form.id?"Modification du":"Nouveau"} Client</h4>
                        </div>
                        <div className="card-body">
                            <form action="#">
                                <div className="row gy-4">
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="fname" className="form-label mb-8 h6">Nom</label>
                                        <input type="text" className="form-control py-11" id="fname" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }) }}
                                            placeholder="Entrer le nom" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="lname" className="form-label mb-8 h6">Genre</label>
                                        <select className="form-control py-11" value={form.gender} onChange={(e) => { setForm({ ...form, gender: e.target.value }) }}>
                                            <option hidden>Selectionner une option</option>
                                            <option value="Masculin">Masculin</option>
                                            <option value="Feminin">Feminin</option>
                                        </select>
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="address" className="form-label mb-8 h6">Addresse</label>
                                        <input type="text" className="form-control py-11" id="address" value={form.address} onChange={(e) => { setForm({ ...form, address: e.target.value }) }}
                                            placeholder="Entrer une addresse" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="telephone" className="form-label mb-8 h6">Telephone</label>
                                        <PhoneInput
                                            country={"cd"}
                                            placeholder="Entrer un numero de telephone"
                                            inputStyle={{ width: '100%' }}
                                            value={form.phone}
                                            onChange={(e) => { setForm({ ...form, phone: e }) }}
                                        />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="email" className="form-label mb-8 h6">Email</label>
                                        <input type="email" className="form-control py-11" id="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }) }}
                                            placeholder="Entrer un email" />
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
    </>
}

export default ClientForm