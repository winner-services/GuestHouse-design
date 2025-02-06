import { useContext, useEffect, useState } from "react"
import Modal from 'react-bootstrap/Modal';
import { MainContext } from "../../config/MainContext"
import Pagination from "../../pagination/Pagination"

function CompteTresoreriePage() {
    const [formVisible, seteFormVisible] = useState(false)
    const [singleClient, setSingleClient] = useState({})
    const [data, setData] = useState([])
    const [entries, setEntries] = useState([])
    const { setLoader } = useContext(MainContext);
    const [form, setForm] = useState({
        designation:""
    })

    const hideForm = () => {
        seteFormVisible(false)
        getData();
        Object.keys(singleClient).forEach(function (key, index) {
            delete singleClient[key];
        });
    }

    const getData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getAllAccounts?page=${page}&q=${q}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const submitData = async (e) => {
        e.preventDefault()

        let url = `createAccount`
        let method = 'POST'
        if (form.id) {
            url = `updateAccount/${form.id}`
            method = 'PUT'
            // insertUpdateFn(url, method, form)
        }

        setLoader(true)
        try {

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(form),
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Un compte a ete insere avec success", "Success");
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

    const modelUpdate = (model) => {
        setForm({designation:model.designation, reference:model.reference, id: model.id})
        seteFormVisible(true)
    }

    const searchDataFn = (searchData) => {
        if (searchData) {
            let term = searchData.toLowerCase();
            getData(1,term);
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
                        <li><span className="text-main-600 fw-normal text-15">Comptes de tresorerie</span></li>
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
                        <button className="btn btn-primary" onClick={() => seteFormVisible(true)}>Ajouter</button>
                    </div>
                </div>
                {/* Breadcrumb Right End */}
            </div>


            <div className="card overflow-hidden">
                <div className="card-body p-0 overflow-x-auto">
                    <table id="studentTable" className="table table-striped">
                        <thead>
                            <tr>
                                <th className="fixed-width"> #</th>
                                <th className="h6 text-gray-300">Designation</th>
                                <th className="h6 text-gray-300">Reference</th>
                                <th className="h6 text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.length > 0 ? (
                                    data.map((item, index) => (
                                        <tr key={index}>
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.designation}</span></td>
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.reference}</span></td>
                                            <td>
                                                <button className="btn btn-main p-9 me-1" onClick={() => modelUpdate(item)}><i className="ph ph-pen text-white"></i></button>
                                                <button className="btn btn-danger p-9" onClick={() => modelDette(item)}><i className="ph ph-trash text-white"></i></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (<tr>
                                    <td colSpan={4}>
                                        <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                    </td>
                                </tr>)

                            }
                        </tbody>
                    </table>
                </div>
                <div className="paginate mt-3">
                    <Pagination data={entries} limit={2} onPageChange={getResult} />
                </div>
            </div>

        </div>
        <Modal show={formVisible} onHide={hideForm} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Nouveau un compte</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <div className="col-sm-12 col-xs-12">
                    <label for="address" className="form-label mb-8 h6">Designation</label>
                    <input type="text" className="form-control py-11" id="address" value={form.designation} onChange={(e) => { setForm({ ...form, designation: e.target.value }) }}
                        placeholder="Entrer une designation" />
                </div>
                <div className="col-sm-12 col-xs-12">
                    <label for="address" className="form-label mb-8 h6">Reference</label>
                    <input type="text" className="form-control py-11" id="address" value={form.reference} onChange={(e) => { setForm({ ...form, reference: e.target.value }) }}
                        placeholder="Entrer une Reference" />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideForm}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
            </Modal.Footer>
        </Modal>
    </>

}

export default CompteTresoreriePage