import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../../config/MainContext";

function ClotureChambre({hideForm, singleRoom}) {
    const [transasctionData, setTransactionData] = useState([])
    const [detteData, setDetteData] = useState([])
    const [affectationData, setAffectationData] = useState({})
    const [reduction, setReduction] = useState(0)
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
        origin_room_id: singleRoom.id,
        destination_room_id:""
    })

    const submitData = async () => {

        let url = `createCloseStay`
        let method = 'POST'
        let single_form = {
            "total_amount": (getDaysBetweenDates(affectationData.start_date, affectationData.end_date) * (singleRoom.unite_price)) + (Object.values(detteData).reduce((acc, item) => acc + (item.loan_amount), 0)) - (Object.values(transasctionData).reduce((acc, item) => acc + (item.amount), 0)),
            "affectation_id": affectationData.id,
            "room_id": singleRoom.id,
            "reduction": reduction
        }

        setLoader(true)
        try {

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(single_form),
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Une chambre a ete cloturee avec success", "Success");
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

    const getDetteClientOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getDetteByRoomId/${singleRoom.id}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setDetteData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getTransactionOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getTranstionByRoomId/${singleRoom.id}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setTransactionData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getAffectationOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getAffectationByRoomId/${singleRoom.id}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setAffectationData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    function getDaysBetweenDates(startDateString, endDateString) {
        // Convert strings to Date objects
        const startDate = new Date(startDateString);
        const endDate = new Date(endDateString);
      
        // Calculate the difference in  milliseconds
        const timeDiff = endDate - startDate;
      
        // Convert milliseconds to days
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
        return daysDiff;
    }

    useEffect(()=>{
        getDetteClientOptions()
        getTransactionOptions()
        getAffectationOptions()
    },[])

    return <>
        <div className="row">
            <h4>Cloturer le sejour du client</h4>
            <div className="col-sm-12 col-xs-12 mb-8">
                <ul className="list-group list-group-flush">
                    {detteData.map((item,index)=><>
                        <li className="list-group-item" key={index}>{item.motif} : {item.loan_amount - item.paid_amount} $</li>
                    </>)}
                    <li className="list-group-item">Nombre des nuites: {getDaysBetweenDates(affectationData.start_date, affectationData.end_date)} jours</li>
                    <li className="list-group-item">Prix Unitaire: {singleRoom.unite_price} $</li>
                    <li className="list-group-item">Prix Total de location chambre: {getDaysBetweenDates(affectationData.start_date, affectationData.end_date) * (singleRoom.unite_price)} $</li>
                    <li className="list-group-item">Montant paye: {Object.values(transasctionData).reduce((acc, item) => acc + (item.amount), 0)} $</li>
                    <li className="list-group-item">Redution: <input value={reduction} onChange={(e)=> setReduction(e.target.value)} type="number" style={{border:0, width:70}} /></li>
                    <li className="list-group-item"><strong>PRIX TOTAL : {((getDaysBetweenDates(affectationData.start_date, affectationData.end_date) * (singleRoom.unite_price)) + (Object.values(detteData).reduce((acc, item) => acc + (item.loan_amount), 0)) - (Object.values(transasctionData).reduce((acc, item) => acc + (item.amount), 0))) - reduction} $</strong></li>
                </ul>
            </div>

            <div className="col-sm-12">
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9 me-1" onClick={hideForm}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
            </div>
            
        </div>

    </>
}

export default ClotureChambre