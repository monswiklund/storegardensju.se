import välkomstBild from "../assets/logoTransp.png";

function VälkomstBild() {
  return (
    <div className="stor-logga-container">
      <div className="stor-logga">
        <img src={välkomstBild} alt="Lägg till Storegården 7 Loggan" />
      </div>
      <div className="titel">
        <h2>En plats för kreativt nöje!</h2>
      </div>
    </div>
  );
}

export default VälkomstBild;
