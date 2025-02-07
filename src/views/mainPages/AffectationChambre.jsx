import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../config/MainContext"
import Modal from 'react-bootstrap/Modal';
import AttributionChambreForm from "./components/chambre/AttributionChambreForm";
import ReservationChambreForm from "./components/chambre/ReservationChambreForm";
import TransfertChambreForm from "./components/chambre/TransfertChambreForm";
import ClotureChambre from "./components/chambre/ClotureChambre";

function AffectationChambre() {
    const [formVisible, setFormVisible] = useState(false)
    const [singleClient, setSingleClient] = useState({})
    const [data, setData] = useState([])
    const [entries, setEntries] = useState([])
    const { setLoader } = useContext(MainContext);
    const [deviseData, setDeviseData] = useState([]);
    const [deviseValue, setDeviseValue] = useState({});
    const [singleChambre, setSingleChambre] = useState({});
    const [room_operation, setRoomOps] = useState(0);
    const [form, setForm] = useState({
        costumer_id: ""
    })

    const hideAllForms = () => {
        setRoomOps(0)
    }

    const hideForm = () => {
        setFormVisible(false)
        setRoomOps(0)
        getData();
        Object.keys(singleClient).forEach(function (key, index) {
            delete singleClient[key];
        });
    }

    const getData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getRoomData?page=${page}&q=${q}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setData(res.data.data);
                setEntries(res.data);
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

    const showAffectationModel = (model) => {
        setSingleChambre(model)
        setFormVisible(true)
    }

    const searchDataFn = (searchData) => {
        if (searchData) {
            let term = searchData.toLowerCase();
            getData(1, term);
        } else {
            getData();
        }
    };

    const getResult = (pages) => {

        if (!pages) {
            pages = 1;
        }
        getData(pages);
    }

    useEffect(() => {
        getData()
    }, [])

    return <>
        <div className="dashboard-body">

            <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                {/* Breadcrumb Start */}
                <div className="breadcrumb mb-24">
                    <ul className="flex-align gap-4">
                        <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a>
                        </li>
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><span className="text-main-600 fw-normal text-15">Affectation chambres</span></li>
                    </ul>
                </div>
                {/* Breadcrumb End */}

                {/* Breadcrumb Right Start */}
                <div className="flex-align gap-8 flex-wrap">
                    <div className="position-relative text-gray-500 flex-align gap-4 text-13"></div>
                    <div
                        className="flex-align text-gray-500 text-13 border border-gray-100">
                        <div className="dropdown me-1">
                            <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                {deviseValue ? deviseValue.symbol : ''}
                            </button>
                            <ul className="dropdown-menu">
                                {deviseData.map((item, index) => (
                                    <li key={index}><a className="dropdown-item" type="button" href="#" onClick={() => changeDevise(item)}>{item.symbol}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Breadcrumb Right End */}
            </div>


            <div className="card overflow-hidden">
                <div className="card-body p-0 overflow-x-auto">
                    <div className="row g-20 p-30" >
                        <i style={{marginTop:0, fontWeight:'bold'}}>* Legende: </i>
                        <div className="d-flex" style={{alignItems:'center', marginTop:0}}>
                            <i className="bg-main-100 rounded-8 me-2" style={{width:40, height:20}}></i>
                            <span> : Chambres Libres</span>
                        </div>
                        <div className="d-flex" style={{alignItems:'center', marginTop:0}}>
                            <i className="bg-success-100 rounded-8 me-2" style={{width:40, height:20}}></i>
                            <span> : Chambres Occupées</span>
                        </div>
                        <div className="d-flex" style={{alignItems:'center', marginTop:0}}>
                            <i className="bg-warning-100 rounded-8 me-2" style={{width:40, height:20}}></i>
                            <span> : Chambres Reservées</span>
                        </div>
                        
                    </div>
                    <div className="row g-20 p-3">
                        {data.map((item, index) => (
                            <div key={index} className="col-lg-2 col-sm-3">
                                <div className="card border border-gray-100">
                                    <div className="card-body p-8">
                                        <a href="#" onClick={() => showAffectationModel(item)}
                                            className={`bg-${item.status == 'Libre' ? 'main' : item.status == 'Occupée' ? 'success' : item.status == 'Réservée' ? 'warning' : ''}-100 rounded-8 overflow-hidden text-left mb-8 h-164 flex-center p-8`}>
                                            {item.designation} - {item.categorie}<br />
                                            Prix: {get_net_value(item.unite_price)}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>

        </div>

        <Modal show={formVisible} onHide={hideForm} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title style={{ marginBottom: 0 }}>Chambre : {singleChambre.designation}  - {singleChambre.categorie}<br />
                    <small style={{ fontSize: 15, fontWeight: 'normal' }}>Prix: {get_net_value(singleChambre.unite_price)}</small><br />
                    <small style={{ fontSize: 15, fontWeight: 'normal' }}>Etat: {singleChambre.status}</small>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {room_operation == 0 ? <>
                    <div className="col-sm-12 col-xs-12 mb-8">
                        <ul class="list-group">
                            {singleChambre.status == 'Libre' || singleChambre.status == 'Réservée'?<>
                                <li class="list-group-item"><a href="#" onClick={() => setRoomOps(1)}>Attribuer la chambre</a></li>
                                <li class="list-group-item"><a href="#" onClick={() => setRoomOps(2)}>Reserver la chambre</a></li>
                            </>:null}
                            {singleChambre.status == 'Occupée'?<>
                                <li class="list-group-item"><a href="#" onClick={() => setRoomOps(3)}>Transferer le client</a></li>
                                <li class="list-group-item"><a href="#" onClick={() => setRoomOps(4)}>Cloturer le sejour du client</a></li>
                             </>:null}
                        </ul>
                    </div>
                    <div className="col-sm-12">
                        <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9 me-1" onClick={hideForm}>Annuler</button>
                    </div>
                </> : room_operation == 1 ?
                    (
                        <AttributionChambreForm hideForm={hideAllForms} singleRoom={singleChambre} />
                    ) : room_operation == 2 ?
                        (
                            <ReservationChambreForm hideForm={hideAllForms} singleRoom={singleChambre} />
                        ) : room_operation == 3 ?
                            (
                                <TransfertChambreForm hideForm={hideAllForms} singleRoom={singleChambre} />
                            ) : room_operation == 4 ?
                                (
                                    <ClotureChambre hideForm={hideAllForms} singleRoom={singleChambre} />
                                ) : ''}

            </Modal.Body>
        </Modal>
    </>

}

export default AffectationChambre