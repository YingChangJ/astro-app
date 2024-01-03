import { useOutletContext } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import { DateTime } from "../lib/luxon.min.js";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";

export default function Entry() {
  const [dateTime, setDateTime, location, setLocation] = useOutletContext();

  const [inputValues, setInputValues] = useState({
    year: dateTime.year,
    month: dateTime.month,
    day: dateTime.day,
    hour: dateTime.hour,
    minute: dateTime.minute,
    second: dateTime.second,
    timeZone: dateTime.toFormat("Z"),
    lonDeg: Math.abs(location.longitude),
    latDeg: Math.abs(location.latitude),
    lonMin: 0,
    lonSec: 0,
    latMin: 0,
    latSec: 0,
    // ew: location.longitude >= 0,
    // ns: location.latitude >= 0,
  });
  const [locationDirection, setLocationDirection] = useState({
    ew: location.longitude >= 0,
    ns: location.latitude >= 0,
  });

  const regex = /^[-0-9.]*$/;
  function handleInputChange(identifier, e) {
    const value = e.target.value;
    if (regex.test(value) || value === "") {
      setInputValues((prevValues) => ({
        ...prevValues,
        [identifier]: value,
      }));
    }
  }
  function handleLocationDirectionChange(identifier) {
    setLocationDirection((prevValues) => ({
      ...prevValues,
      [identifier]: !prevValues[identifier],
    }));
  }
  function handleSubmit(e) {
    e.preventDefault(); // 阻止表單的默認提交行為
    //dateTime
    const parsedYear = parseInt(inputValues.year);
    const parsedMonth = parseInt(inputValues.year);
    const parsedDay = parseFloat(inputValues.year);
    const parsedHour = parseFloat(inputValues.year);
    const parsedMinute = parseFloat(inputValues.year);
    const parsedSecond = parseInt(inputValues.year);
    const parsedTimeZone = parseFloat(inputValues.year);

    const updatedDateTime = DateTime.fromObject(
      {
        year: isNaN(parsedYear) ? dateTime.year : parsedYear,
        month: isNaN(parsedMonth) ? dateTime.year : parsedMonth,
        day: isNaN(parsedDay) ? dateTime.year : parsedDay,
        hour: isNaN(parsedHour) ? dateTime.year : parsedHour, // 时、分、秒等属性可以根据需要添加
        minute: isNaN(parsedMinute) ? dateTime.year : parsedMinute,
        second: isNaN(parsedSecond) ? dateTime.year : parsedSecond,
      },
      {
        zone: (isNaN(parsedTimeZone) ? dateTime.timeZone : parsedTimeZone) * 60,
      }
    );
    if (updatedDateTime.isValid) {
      const takeFractionalHour = updatedDateTime.plus({
        seconds:
          ((parseFloat(inputValues.hour) || 0) % 1) * 3600 +
          ((parseFloat(inputValues.day) || 0) % 1) * 86400 +
          ((parseFloat(inputValues.minute) || 0) % 1) * 60,
      });
      setDateTime(takeFractionalHour);
    }
    //location
    const longitude =
      ((parseFloat(inputValues.lonDeg) || 0) +
        (parseFloat(inputValues.lonMin) || 0) / 60 +
        (parseFloat(inputValues.lonSec) || 0) / 3600) *
      (locationDirection.ew ? 1 : -1);
    const latitude =
      ((parseFloat(inputValues.latDeg) || 0) +
        (parseFloat(inputValues.latMin) || 0) / 60 +
        (parseFloat(inputValues.latSec) || 0) / 3600) *
      (locationDirection.ns ? 1 : -1);
    setLocation({ longitude, latitude });
  }
  function handleClear() {
    setInputValues({
      year: "",
      month: "",
      day: "",
      hour: "",
      minute: "",
      second: "",
      timeZone: "",
      lonDeg: "",
      latDeg: "",
      lonMin: "",
      lonSec: "",
      latMin: "",
      latSec: "",
    });
  }
  // function handleReset() {
  //   setInputValues({
  //     year: dateTime.year,
  //     month: dateTime.month,
  //     day: dateTime.day,
  //     hour: dateTime.hour,
  //     minute: dateTime.minute,
  //     second: dateTime.second,
  //     timeZone: dateTime.toFormat("Z"),
  //     lonDeg: Math.abs(location.longitude),
  //     latDeg: Math.abs(location.latitude),
  //     lonMin: 0,
  //     lonSec: 0,
  //     latMin: 0,
  //     latSec: 0,
  //   });
  //   setLocationDirection({
  //     ew: location.longitude >= 0,
  //     ns: location.latitude >= 0,
  //   });
  // }
  const buttonStyle = {
    width: "40px", // 或者您可以使用相對單位，例如 '2em'
  };
  const LonLatStyle = {
    width: "50px", // 或者您可以使用相對單位，例如 '2em'
  };
  return (
    <Form className="col-sm-12 col-md-8 col-xl-6 container">
      <InputGroup size="sm" className="mb-3">
        <InputGroup.Text>Year</InputGroup.Text>
        <Form.Control
          aria-label="year"
          type="number"
          inputMode="numeric"
          value={inputValues.year}
          onChange={(e) => handleInputChange("year", e)}
          placeholder={dateTime.year}
          size="sm"
        />
        <InputGroup.Text>Month</InputGroup.Text>
        <Form.Control
          aria-label="month"
          type="number"
          inputMode="numeric"
          value={inputValues.month}
          onChange={(e) => handleInputChange("month", e)}
          placeholder={dateTime.month}
          size="sm"
        />
        <InputGroup.Text>Day</InputGroup.Text>
        <Form.Control
          aria-label="day"
          type="number"
          inputMode="numeric"
          value={inputValues.day}
          onChange={(e) => handleInputChange("day", e)}
          placeholder={dateTime.day}
          size="sm"
        />
      </InputGroup>
      <InputGroup size="sm" className="mb-3">
        <InputGroup.Text>Hour</InputGroup.Text>
        <Form.Control
          aria-label="hour"
          type="number"
          inputMode="numeric"
          value={inputValues.hour}
          onChange={(e) => handleInputChange("hour", e)}
          placeholder={dateTime.hour}
          size="sm"
        />
        <InputGroup.Text>Minute</InputGroup.Text>
        <Form.Control
          aria-label="minute"
          type="number"
          inputMode="numeric"
          value={inputValues.minute}
          onChange={(e) => handleInputChange("minute", e)}
          placeholder={dateTime.minute}
          size="sm"
        />
        <InputGroup.Text>Second</InputGroup.Text>
        <Form.Control
          aria-label="second"
          type="number"
          inputMode="numeric"
          value={inputValues.second}
          onChange={(e) => handleInputChange("second", e)}
          placeholder={dateTime.second}
          size="sm"
        />
      </InputGroup>
      <InputGroup size="sm" className="mb-3">
        <InputGroup.Text>UTC</InputGroup.Text>
        <Form.Control
          type="text"
          inputMode="numeric"
          value={inputValues.timeZone}
          onChange={(e) => handleInputChange("timeZone", e)}
          placeholder={dateTime.toFormat("Z")}
          size="sm"
          aria-label="timeZone"
        />
      </InputGroup>
      <InputGroup size="sm" className="mb-3">
        <InputGroup.Text style={LonLatStyle}>Lon</InputGroup.Text>
        <Button
          onClick={() => handleLocationDirectionChange("ew")}
          size="sm"
          style={buttonStyle}
          variant="outline-primary"
        >
          {locationDirection.ew ? "E" : "W"}
        </Button>
        <Form.Control
          aria-label="longitude"
          type="number"
          inputMode="numeric"
          value={inputValues.lonDeg}
          onChange={(e) => handleInputChange("lonDeg", e)}
          placeholder={location.longitude}
          size="sm"
        />
        <InputGroup.Text>°</InputGroup.Text>
        <Form.Control
          aria-label="lonMinute"
          type="number"
          inputMode="numeric"
          value={inputValues.lonMin}
          onChange={(e) => handleInputChange("lonMin", e)}
          placeholder={0}
          size="sm"
        />
        <InputGroup.Text>′</InputGroup.Text>
        <Form.Control
          aria-label="longitude Second"
          type="number"
          inputMode="numeric"
          value={inputValues.lonSec}
          onChange={(e) => handleInputChange("lonSec", e)}
          placeholder={0}
          size="sm"
        />
        <InputGroup.Text>″</InputGroup.Text>
      </InputGroup>
      <InputGroup size="sm" className="mb-3">
        <InputGroup.Text style={LonLatStyle}>Lat</InputGroup.Text>
        <Button
          onClick={() => handleLocationDirectionChange("ns")}
          size="sm"
          style={buttonStyle}
          variant="outline-primary"
        >
          {locationDirection.ns ? "N" : "S"}
        </Button>
        <Form.Control
          aria-label="latitude"
          type="number"
          inputMode="numeric"
          value={inputValues.latDeg}
          onChange={(e) => handleInputChange("latDeg", e)}
          placeholder={location.latitude}
          size="sm"
        />
        <InputGroup.Text>°</InputGroup.Text>
        <Form.Control
          aria-label="latMinute"
          type="number"
          inputMode="numeric"
          value={inputValues.latMin}
          onChange={(e) => handleInputChange("latMin", e)}
          placeholder={0}
          size="sm"
        />
        <InputGroup.Text>′</InputGroup.Text>
        <Form.Control
          aria-label="latSecond"
          type="number"
          inputMode="numeric"
          value={inputValues.latSec}
          onChange={(e) => handleInputChange("latSec", e)}
          placeholder={0}
          size="sm"
        />
        <InputGroup.Text>″</InputGroup.Text>
      </InputGroup>
      <div>
        {" "}
        <Button onClick={handleSubmit} size="sm">
          Submit
        </Button>
        <Button onClick={handleClear} size="sm" className="m-2">
          Clear
        </Button>
        {/* <Button onClick={handleReset} size="sm">
          Reset
        </Button> */}
      </div>
    </Form>
  );
}
