import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../../config/MainContext";

function AttributionChambreForm({hideForm, singleRoom}) {
    const [clientData, setclientData] = useState([])
    const { setLoader } = useContext(MainContext);
    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    const [form, setForm] = useState({
        customer_id: "",
        room_id:singleRoom.id,
        paid_amount:0,
        start_date:today,
        end_date:today,
        index:2
    })

    function formatDate(isoString) {
        // Create a Date object from the ISO string
        const date = new Date(isoString);
      
        // Extract individual components
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const  
       hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2,  
       '0');
      
        // Construct the desired format
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const submitData = async () => {

        let url = `createAssignment`
        let method = 'POST'

        setLoader(true)
        form.start_date = formatDate(form.start_date)
        form.end_date = formatDate(form.end_date)
        try {

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(form),
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Une chambre a ete attribue avec success", "Success");
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

    const getClientOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getCustomerOptions`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setclientData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }


    useEffect(()=>{
        getClientOptions()
    },[])

    return <>
        <div className="row">
            <h4>Attribuer la chambre</h4>
            <div className="col-sm-12 col-xs-12 mb-8">
                <label htmlFor="fname" className="form-label mb-8 h6">Montant payé</label>
                <input type="number" className="form-control py-11" id="fname" value={form.paid_amount} onChange={(e) => { setForm({ ...form, paid_amount: e.target.value }) }}
                    placeholder="Entrer un montant" />
            </div>
            <div className="col-sm-12 col-xs-12 mb-8">
                <label htmlFor="email" className="form-label mb-8 h6">Client</label>
                <select id="" value={form.customer_id} onChange={(e) => { setForm({ ...form, customer_id: e.target.value }) }} className="form-control py-11">
                    <option hidden>Selectionnez un client</option>
                    {clientData.map((item, index) => (
                        <option value={item.id} key={index}>{item.name}</option>
                    ))}
                </select>
            </div>
            <div className="col-sm-6 col-xs-6 mb-8">
                <label htmlFor="fname" className="form-label mb-8 h6">Date debut</label>
                <input type="datetime-local" className="form-control py-11" id="fname" value={form.start_date} onChange={(e) => { setForm({ ...form, start_date: e.target.value }) }}
                    placeholder="Entrer une date" />
            </div>
            <div className="col-sm-6 col-xs-6 mb-8">
                <label htmlFor="fname" className="form-label mb-8 h6">Date de fin</label>
                <input type="datetime-local" className="form-control py-11" id="fname" value={form.end_date} onChange={(e) => { setForm({ ...form, end_date: e.target.value }) }}
                    placeholder="Entrer une date" />
            </div>

            <div className="col-sm-12">
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9 me-1" onClick={hideForm}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
            </div>
            
        </div>

    </>
}

export default AttributionChambreForm