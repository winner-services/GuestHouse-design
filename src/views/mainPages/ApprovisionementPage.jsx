import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../config/MainContext"
import Pagination from "../../pagination/Pagination"
import ApprovisionementForm from "./components/ApprovisionementForm"
import ApprovisionnementViewmore from "./components/ApprovisionnementViewmore"
import { Dropdown } from 'react-bootstrap';

function ApprovisionementPage() {
    const [formVisible, seteFormVisible] = useState(false)
    const [viewmoreVisible, setViewmoreVisible] = useState(false)
    const [singleClient, setSingleClient] = useState({})
    const [data, setData] = useState([])
    const [entries, setEntries] = useState([])
    const { setLoader } = useContext(MainContext);
    const [deviseData, setDeviseData] = useState([]);
    const [deviseValue, setDeviseValue] = useState({});

    const hideForm = () => {
        seteFormVisible(false)
        setViewmoreVisible(false)
        getData();
        Object.keys(singleClient).forEach(function (key, index) {
            delete singleClient[key];
        });
    }

    const getData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getSupplyData?page=${page}&q=${q}`, {
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

    const modelViewmore = (model) => {
        setSingleClient(model)
        setViewmoreVisible(true)
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


    if (formVisible == false && viewmoreVisible == false) {
        return <>
            <div className="dashboard-body">

                <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                    {/* Breadcrumb Start */}
                    <div className="breadcrumb mb-24">
                        <ul className="flex-align gap-4">
                            <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a>
                            </li>
                            <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                            <li><span className="text-main-600 fw-normal text-15">Liste des approvisionements</span></li>
                        </ul>
                    </div>
                    {/* Breadcrumb End */}

                    {/* Breadcrumb Right Start */}
                    <div className="flex-align gap-8 flex-wrap">
                        <div className="position-relative text-gray-500 flex-align gap-4 text-13">
                            <input type="text" className="form-control" placeholder="Chercher..." onChange={(e) => { searchDataFn(e.target.value) }} />
                        </div>
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
                            <button className="btn btn-primary" onClick={() => seteFormVisible(true)}>Ajouter</button>
                        </div>
                    </div>
                    {/* Breadcrumb Right End */}
                </div>


                <div className="card overflow-hidden">
                    <div className="card-body overflow-x-auto">
                        <table id="studentTable" className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th className="fixed-width"> #</th>
                                    <th className="h6 text-gray-300">Date</th>
                                    <th className="h6 text-gray-300">Reference</th>
                                    <th className="h6 text-gray-300">Fournisseurs</th>
                                    <th className="h6 text-gray-300">Prix Total</th>
                                    <th className="h6 text-gray-300">Montant payé</th>
                                    <th className="h6 text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data.length > 0 ? (
                                        data.map((item, index) => (
                                            <tr key={index}>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.purchase_date}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.reference}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.name}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.total_price)}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.paid_amount)}</span></td>
                                                <td>
                                                    <button className="btn btn-main p-9 me-1" onClick={() => modelViewmore(item)}><i className="ph ph-eye text-white"></i></button>
                                                    <button className="btn btn-danger p-9" onClick={() => modelDette(item)}><i className="ph ph-trash text-white"></i></button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (<tr>
                                        <td colSpan={6}>
                                            <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                        </td>
                                    </tr>)

                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="paginate mt-3 mb-8">
                        <Pagination data={entries} limit={2} onPageChange={getResult} />
                    </div>
                </div>

            </div>
        </>
    } else if (formVisible == true && viewmoreVisible == false) {
        return <ApprovisionementForm hideForm={hideForm} />
    } else if (formVisible == false && viewmoreVisible == true) {
        return <ApprovisionnementViewmore hideForm={hideForm} singleClient={singleClient} />
    }

}

export default ApprovisionementPage