import { useContext, useState } from "react";
import Modal from 'react-bootstrap/Modal';

import ProductStatisticReport from "./components/reports/ProductStatisticReport";

function RapportPage() {
    const [modalVisible, setModalVisible] = useState(false);
    const [showReport, setShowReport] = useState(0);
    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    const [form, setForm] = useState({
        date_start: today,
        date_end: today
    })
    const hideModal = () => {
        setForm({ ...form, date_end: today, date_start: today })
        setModalVisible(false)
    }

    if (showReport == 0) {
        return <>
            <div className="dashboard-body">

                <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                    {/* Breadcrumb Start */}
                    <div className="breadcrumb mb-24">
                        <ul className="flex-align gap-4">
                            <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a>
                            </li>
                            <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                            <li><span className="text-main-600 fw-normal text-15">Rapports</span></li>
                        </ul>
                    </div>
                    {/* Breadcrumb End */}

                </div>

                <div className="card overflow-hidden">
                    <div className="card-body p-0">
                        <div className="table-reponive m-3">
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td><a href="#" onClick={() => setModalVisible(true)}>Statistique periodique des produits</a></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={modalVisible} onHide={hideModal} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Statistique periodique des produits</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-sm-6 col-xs-6">
                            <label htmlFor="address" className="form-label mb-8 h6">Date debut</label>
                            <input type="date" className="form-control py-11" id="address" value={form.date_start} onChange={(e) => { setForm({ ...form, date_start: e.target.value }) }}
                            />
                        </div>
                        <div className="col-sm-6 col-xs-6">
                            <label htmlFor="address" className="form-label mb-8 h6">Date fin</label>
                            <input type="date" className="form-control py-11" id="address" value={form.date_end} onChange={(e) => { setForm({ ...form, date_end: e.target.value }) }}
                            />
                        </div>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideModal}>Annuler</button>
                    <button type="button" className="btn btn-main rounded-pill py-9" onClick={() => setShowReport(1)}>Telecharger</button>
                </Modal.Footer>
            </Modal>
        </>
    } else if (showReport == 1) {
        return <ProductStatisticReport hideForm={hideModal} form={form} />
    }

}

export default RapportPage