import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../config/MainContext";
import Modal from 'react-bootstrap/Modal';
import { Dropdown } from 'react-bootstrap';

function ClientViewmore({ hideForm, singleClient }) {
    const [data, setData] = useState([])
    const { setLoader } = useContext(MainContext);
    const [deviseData, setDeviseData] = useState([]);
    const [deviseValue, setDeviseValue] = useState({});
    const [formVisible, seteFormVisible] = useState(false)

    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;

    const [form, setForm] = useState({
        transaction_date: today,
        paid_amount: 0,
        customer_id: singleClient.id
    })

    const hideModalForm = () => {
        seteFormVisible(false)
        getData();
        Object.keys(data).forEach(function (key, index) {
            delete data[key];
        });
    }

    const getData = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getDebtsCutomer/${singleClient.id}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setData(res.data);
                setDeviseData(res.devise)
                setDeviseValue(Object.values(res.devise).filter(devise => devise.currency_type == 'devise_principale')[0])
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const changeDevise = (model) => {
        setDeviseValue(model)
    }

    const get_net_value = (value) => {
        if (value) {
            let result = Number(value) * Number(deviseValue.conversion_amount)
            return `${result} ${deviseValue.symbol}`
        } else {
            return `0 $`
        }
    }

    const submitData = async (e) => {
        e.preventDefault()

        let url = `paymentDebtCustomer`
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
                toastr.success("Une dette a ete payee avec success", "Success");
                hideModalForm(false)
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
        getData()
    }, [])

    return <>
        <div className="dashboard-body">
            {/* Breadcrumb Start */}
            <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                {/* Breadcrumb Start */}
                <div className="breadcrumb mb-24">
                    <ul className="flex-align gap-4">
                        <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a></li>
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Clients</a></li>
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><span className="text-main-600 fw-normal text-15">Details</span></li>
                    </ul>
                </div>
                {/* Breadcrumb End */}

                {/* Breadcrumb Right Start */}
                <div className="flex-align gap-8 flex-wrap">
                    <div
                        className="flex-align text-gray-500 text-13 border border-gray-100 rounded-4 ">
                        <Dropdown className="me-1">
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                {deviseValue ? deviseValue.symbol : ''}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {deviseData.map((item, index) => (
                                    <Dropdown.Item key={index} onClick={() => changeDevise(item)}>
                                        {item.symbol}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                        <button className="btn btn-secondary me-1" onClick={hideForm}>Retour</button>
                        <button className="btn btn-primary" onClick={() => seteFormVisible(true)}>Paiement</button>
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
                        <div className="card-header">
                            <span>Nom: {singleClient.name}</span><br />
                            <span>Genre: {singleClient.gender == "Masculin" ? 'Masculin' : 'Feminin'}</span><br />
                            <span>Addresse: {singleClient.address}</span><br />
                            <span>Telephone: {singleClient.phone}</span><br />
                            <span>Email: {singleClient.email}</span><br />
                        </div>
                        <div className="card-body">
                            <h4 className="d-flex justify-content-center">LISTE DES DETTES DU CLIENT</h4>
                            <div className="card overflow-hidden">
                                <div className="card-body p-0 overflow-x-auto">
                                    <table id="studentTable" className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th className="fixed-width"> #</th>
                                                <th className="h6 text-gray-300">Date</th>
                                                <th className="h6 text-gray-300">Motif</th>
                                                <th className="h6 text-gray-300">Montant Total</th>
                                                <th className="h6 text-gray-300">Deja Payé</th>
                                                <th className="h6 text-gray-300">Montant Restant</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                data.length > 0 ? (
                                                    data.map((item, index) => (
                                                        <tr key={index}>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.transaction_date}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.motif}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.loan_amount)}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.paid_amount)}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.loan_amount - item.paid_amount)}</span></td>
                                                        </tr>
                                                    ))
                                                ) : (<tr>
                                                    <td colSpan={6}>
                                                        <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                                    </td>
                                                </tr>)

                                            }
                                            <tr>
                                                <td colSpan={3}>
                                                    <strong className="d-flex justify-content-center">TOTAL</strong>
                                                </td>
                                                <td><strong>{get_net_value(Object.values(data).reduce((acc, item) => acc + (item["loan_amount"]), 0))}</strong></td>
                                                <td><strong>{get_net_value(Object.values(data).reduce((acc, item) => acc + (item["paid_amount"]), 0))}</strong></td>
                                                <td><strong>{get_net_value(Object.values(data).reduce((acc, item) => acc + ((item["loan_amount"]) - (item["paid_amount"])), 0))}</strong></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Modal show={formVisible} onHide={hideModalForm} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Paiement des dettes</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="col-sm-12 col-xs-12">
                    <label for="transaction_date" className="form-label mb-8 h6">Date de transaction</label>
                    <input type="date" className="form-control py-11" id="transaction_date" value={form.transaction_date} onChange={(e) => { setForm({ ...form, transaction_date: e.target.value }) }}
                        placeholder="Entrer une date" />
                </div>
                <div className="col-sm-12 col-xs-12">
                    <label for="amount" className="form-label mb-8 h6">Montant a payer</label>
                    <input type="number" className="form-control py-11" id="amount" value={form.paid_amount} onChange={(e) => { setForm({ ...form, paid_amount: e.target.value }) }}
                        placeholder="Entrer un montant" />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideModalForm}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
            </Modal.Footer>
        </Modal>
    </>
}

export default ClientViewmore