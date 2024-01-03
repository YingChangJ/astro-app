import { Outlet, Link } from "react-router-dom";
import { DateTime } from "../lib/luxon.min.js";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
export default function Root() {
  //location and datetime: they are
  const [dateTime, setDateTime] = useState(DateTime.now());
  const [location, setLocation] = useState({ longitude: 0, latitude: 0 });
  const [number, setNumber] = useState("1");
  const [unit, setUnit] = useState("day");
  const [show, setShow] = useState(false); //Modal
  // 处理数字选择变化的回调
  const handleNumberChange = (event) => {
    setNumber(event.target.value);
  };

  // 处理单位选择变化的回调
  const handleUnitChange = (event) => {
    setUnit(event.target.value);
  };
  function addOrMinusTime(sign) {
    setDateTime((prev) => prev.plus({ [unit]: number * sign }));
  }
  function formatLocation(location) {
    const ew = location.longitude >= 0 ? "E" : "W";
    const ns = location.latitude >= 0 ? "N" : "S";
    return (
      <>
        <strong>Lon: </strong>
        {Math.abs(location.longitude).toFixed(4)} {ew} <strong>Lat: </strong>
        {Math.abs(location.latitude).toFixed(4)} {ns}
      </>
    );
  }
  function setTimeNow() {
    setDateTime(DateTime.now());
  }
  return (
    <div className="text-center">
      <div className="nav justify-content-center">
        {/* TODO: 把type搞掉，App内容分流到root, entry and chart */}
        <Link to="type/chart" className="nav-link">
          Chart
        </Link>
        <Link to="type/vedic" className="nav-link ms-5 me-5">
          Vedic
        </Link>
        <Link to="type/bazi" className="nav-link">
          Bazi
        </Link>
      </div>
      <div className="col-md-8 col-xl-6 container">
        <div className="d-flex justify-content-between">
          <p className="fs-6">
            {dateTime.toFormat("yyyy-MM-dd HH:mm:ss Z EEE")}
            <br />
            {formatLocation(location)}
          </p>
          <div className="ms-auto ">
            <div className="col">
              <Button onClick={() => addOrMinusTime(-1)} className="" size="sm">
                -
              </Button>
              <Button size="sm" variant="light" onClick={() => setShow(true)}>
                {number} {unit}
              </Button>

              <Modal
                size="sm"
                show={show}
                onHide={() => setShow(false)}
                dialogClassName="modal-90w"
                aria-label="set time adjust gap"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Jump Step</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="d-flex">
                    <Form.Select
                      size="sm"
                      onChange={handleNumberChange}
                      value={number}
                      // style={{ width: "60px" }}
                    >
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6</option>
                      <option>7</option>
                      <option>8</option>
                      <option>9</option>
                    </Form.Select>
                    <Form.Select
                      size="sm"
                      onChange={handleUnitChange}
                      value={unit}
                    >
                      <option value="sec">second</option>
                      <option value="min">minute</option>
                      <option value="hour">hour</option>
                      <option value="day">day</option>
                      <option value="mon">month</option>
                      <option value="year">year</option>
                    </Form.Select>
                  </div>
                </Modal.Body>
              </Modal>

              <Button onClick={() => addOrMinusTime(1)} className="" size="sm">
                +
              </Button>
              <Button onClick={setTimeNow} className="" size="sm">
                Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Outlet context={[dateTime, setDateTime, location, setLocation]} />
      </div>
    </div>
  );
}
