import { Spinner } from "react-bootstrap";


export default function LoadingSpiner() {
    return (


        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Spinner
                variant="danger"
                animation="border"
                role="status"
            />
        </div>


    )
}