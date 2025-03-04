import { useContext, useEffect, useState } from "react"
import ClientForm from "./components/ClientForm"
import { MainContext } from "../../config/MainContext"
import Pagination from "../../pagination/Pagination"
import ClientViewmore from "./components/ClientViewmore"

function ClientPage() {
    const [formVisible, setFormVisible] = useState(false)
    const [viewmoreVisible, setViewmoreVisible] = useState(false)
    const [singleClient, setSingleClient] = useState({})
    const [data, setData] = useState([])
    const [entries, setEntries] = useState([])
    const { setLoader } = useContext(MainContext);

    const hideForm = () => {
        setFormVisible(false)
        setViewmoreVisible(false)
        getData();
        Object.keys(singleClient).forEach(function (key, index) {
            delete singleClient[key];
        });
    }

    const getData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getCustomerData?page=${page}&q=${q}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("CLIENT DATA:", res.data)
            if (res.data) {
                setData(res.data.data);
                setEntries(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const modelUpdate = (model) => {
        setSingleClient(model)
        setFormVisible(true)
    }

    const modelViewMore = (model) => {
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
                            <li><span className="text-main-600 fw-normal text-15">Clients</span></li>
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
                            <button className="btn btn-primary" onClick={() => setFormVisible(true)}>Ajouter</button>
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
                                    <th className="h6 text-gray-300">Nom</th>
                                    <th className="h6 text-gray-300">Genre</th>
                                    <th className="h6 text-gray-300">Addresse</th>
                                    <th className="h6 text-gray-300">Telephone</th>
                                    <th className="h6 text-gray-300">Pièce Identité</th>
                                    <th className="h6 text-gray-300">Numéro pièce</th>
                                    <th className="h6 text-gray-300">Email</th>
                                    <th className="h6 text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data.length > 0 ? (
                                        data.map((item, index) => (
                                            <tr key={index}>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.name}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.gender == "Masculin" ? 'Masculin' : 'Féminin'}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.address}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.phone}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.identity_document}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.part_number}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.email}</span></td>
                                                <td>
                                                    <button className="btn btn-main p-9 me-1" onClick={() => modelUpdate(item)}><i className="ph ph-pen text-white"></i></button>
                                                    <button className="btn btn-info p-9 me-1" onClick={() => modelViewMore(item)}><i className="ph ph-file-text text-white"></i></button>
                                                    <button className="btn btn-danger p-9" onClick={() => modelDette(item)}><i className="ph ph-trash text-white"></i></button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (<tr>
                                        <td colSpan={9}>
                                            <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                        </td>
                                    </tr>)

                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination mt-3 mb-8">
                        <Pagination data={entries} limit={2} onPageChange={getResult} />
                    </div>
                </div>

            </div>
        </>
    } else if (formVisible == true && viewmoreVisible == false) {
        return <ClientForm hideForm={hideForm} singleClient={singleClient} />
    } else if (formVisible == false && viewmoreVisible == true) {
        return <ClientViewmore hideForm={hideForm} singleClient={singleClient} />
    }

}

export default ClientPage