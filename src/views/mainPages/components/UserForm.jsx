import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../config/MainContext";
import PhoneInput from 'react-phone-input-2'

function UserForm({ hideForm, singleClient }) {
    const [form, setForm] = useState({
        name: "",
        gender: "",
        phone: "",
        address: "",
        email: "",
        password: "",
        role_id: null,
        service_id: null
    })

    const { setLoader } = useContext(MainContext);
    const [roleData, setRoleData] = useState([])
    const [serviceData, setServiceData] = useState([])
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const submitData = async (e) => {
        e.preventDefault()

        let url = `createUser`
        let method = 'POST'
        if (form.id) {
            url = `updateUser/${singleClient.id}`
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
                toastr.success("Un utilisateur a ete insere avec success", "Success");
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

    const getRoleOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getRoleOptions`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setRoleData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getServiceOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getServiceOptions`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setServiceData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    useEffect(() => {
        getRoleOptions()
        getServiceOptions()
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
                        <li><span className="text-main-600 fw-normal text-15">Utilisateurs</span></li>
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
                            <h4 className="mb-4">Nouvel utilisateur</h4>
                        </div>
                        <div className="card-body">
                            <form action="#">
                                <div className="row gy-4">
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="fname" className="form-label mb-8 h6">Nom <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control py-11" id="fname" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }) }}
                                            placeholder="Entrer le nom" />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="lname" className="form-label mb-8 h6">Genre <span className="text-danger">*</span></label>
                                        <select className="form-control py-11" value={form.gender} onChange={(e) => { setForm({ ...form, gender: e.target.value }) }}>
                                            <option hidden>Selectionner une option</option>
                                            <option value="Masculin">Masculin</option>
                                            <option value="Féminin">Féminin</option>
                                        </select>
                                    </div>
                                    {/* <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="address" className="form-label mb-8 h6">Addresse</label>
                                        <input type="text" className="form-control py-11" id="address" value={form.address} onChange={(e) => { setForm({ ...form, address: e.target.value }) }}
                                            placeholder="Entrer une addresse" />
                                    </div> */}
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="telephone" className="form-label mb-8 h6">Telephone <span className="text-danger">*</span></label>
                                        <PhoneInput
                                            country={"cd"}
                                            placeholder="Entrer un numero de telephone"
                                            inputStyle={{ width: '100%' }}
                                            value={form.phone}
                                            onChange={(e) => { setForm({ ...form, phone: e }) }}
                                        />
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="lname" className="form-label mb-8 h6 me-1">Role <span className="text-danger">*</span></label>
                                        <select className="form-control py-11" value={form.role_id} onChange={(e) => { setForm({ ...form, role_id: e.target.value }) }}>
                                            <option hidden>Selectionner une option</option>
                                            {roleData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="email" className="form-label mb-8 h6">Email <span className="text-danger">*</span></label>
                                        <input type="email" className="form-control py-11" id="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }) }}
                                            placeholder="Entrer un email" />
                                    </div>
                                    {/* <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="current-password" className="form-label mb-8 h6">Mot de passe <span className="text-danger">*</span></label>
                                        <div className="position-relative">
                                            <input type="password" className="form-control py-11" id="current-password" value={form.password} onChange={(e) => { setForm({ ...form, password: e.target.value }) }}
                                                placeholder="Entrer un mot de passe" />
                                            <span className="toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y ph ph-eye-slash" id="#current-password"></span>
                                            <span className="position-absolute top-50 translate-middle-y ms-16 text-gray-600 d-flex"><i className="ph ph-lock"></i></span>
                                        </div>
                                    </div> */}
                                    <div className="col-sm-6 col-xs-6">
                                        <label for="current-password" className="form-label mb-8 h6">Mot de passe <span className="text-danger">*</span></label>
                                        <div className="position-relative">
                                            <input type={showPassword ? 'text' : 'password'} className="form-control py-11" onChange={(e) => { setForm({ ...form, password: e.target.value }) }} id="current-password" placeholder="Entrer votre mot de passe" />
                                            <span className="toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y ph ph-eye-slash" id="#current-password" onClick={togglePasswordVisibility}></span>
                                        </div>
                                    </div>
                                    <div className="col-sm-6 col-xs-6">
                                        <label htmlFor="lname" className="form-label mb-8 h6 me-1">Service <span className="text-danger">*</span></label>
                                        <select className="form-control py-11" value={form.service_id} onChange={(e) => { setForm({ ...form, service_id: e.target.value }) }}>
                                            <option hidden>Selectionner une option</option>
                                            {serviceData.map((item, index) => (
                                                <option value={item.id} key={index}>{item.designation}</option>
                                            ))}
                                        </select>
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

export default UserForm