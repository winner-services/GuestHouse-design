import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../config/MainContext";
import { Dropdown } from 'react-bootstrap';

function VenteViewmore({ hideForm, singleClient }) {
    const [data, setData] = useState([])
    const { setLoader } = useContext(MainContext);
    const [deviseData, setDeviseData] = useState([]);
    const [deviseValue, setDeviseValue] = useState({});

    const getData = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getDetailSale/${singleClient.sale_id}`, {
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
        let result = Number(value) * Number(deviseValue.conversion_amount)
        return `${result} ${deviseValue.symbol}`
    }

    useEffect(() => {
        console.log("CLIENT:",singleClient)
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
                        <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Ventes</a></li>
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
                        <div className="card-header">
                            <span>Date de transaction: {singleClient.sale_date}</span><br />
                            <span>Client: {singleClient.customer}</span><br />
                            <span>Montant total: {get_net_value(singleClient.total_price)}</span><br />
                            <span>Montant paye: {get_net_value(singleClient.paid_amount)}</span><br />
                            <span>Montant restant: {singleClient.total_price - singleClient.paid_amount} $</span><br />
                        </div>
                        <div className="card-body">
                            <h4 className="d-flex justify-content-center">DETAIL D'UNE VENTE</h4>
                            <div className="card overflow-hidden">
                                <div className="card-body overflow-x-auto">
                                    <table id="studentTable" className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th className="fixed-width"> #</th>
                                                <th className="h6 text-gray-300">Produit</th>
                                                <th className="h6 text-gray-300">Qte</th>
                                                <th className="h6 text-gray-300">Prix Unitaire</th>
                                                <th className="h6 text-gray-300">Prix Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                data.length > 0 ? (
                                                    data.map((item, index) => (
                                                        <tr key={index}>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.product}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity} {item.unite}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.unite_price)}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.quantity * item.unite_price)}</span></td>
                                                        </tr>
                                                    ))
                                                ) : (<tr>
                                                    <td colSpan={5}>
                                                        <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                                    </td>
                                                </tr>)

                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default VenteViewmore