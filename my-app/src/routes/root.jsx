import { Outlet, Link } from "react-router-dom";
import Col from "react-bootstrap/Col";
import { DateTime } from "../lib/luxon.min.js";
import { useState } from "react";
import Row from "react-bootstrap/Row";
export default function Root() {
  //location and datetime: they are
  const [dateTime, setDateTime] = useState(DateTime.utc());
  const [location, setLocation] = useState({ longitude: 0, latitude: 0 });
  function formatLocation(location) {
    const ew = location.longitude >= 0 ? "E" : "W";
    const ns = location.latitude >= 0 ? "N" : "S";
    return `lon: ${Math.abs(location.longitude).toFixed(
      4
    )} ${ew} lat: ${Math.abs(location.latitude).toFixed(4)} ${ns}`;
  }
  console.log(dateTime);
  return (
    <div className="vh-100 overflow-hidden ">
      <Col className="d-flex mb-2">
        {/* TODO: 把type搞掉，App内容分流到root, entry and chart */}
        <Link to="type/chart" className="mx-3">
          Chart
        </Link>
        <Link to="type/vedic" className="mx-3">
          Vedic
        </Link>
        <Link to="type/bazi" className="mx-3">
          Bazi
        </Link>
      </Col>
      <Row className="d-flex justify-content-center">
        <div>{dateTime.toFormat("yyyy-MM-dd HH:mm:ss ZZ EEE")}</div>
        <div>{formatLocation(location)}</div>
      </Row>
      <div>
        <Outlet context={[dateTime, setDateTime, location, setLocation]} />
      </div>
    </div>
  );
}
