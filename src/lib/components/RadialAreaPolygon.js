import React from "react";
//import "./RadialAreaPolygon.scss";
import circle from "@turf/circle";
import union from "@turf/union";
import PropTypes from "prop-types";
import { GeoJSON } from "react-leaflet";

const _metersPerPixel = {};

const latLngAsGeoJSON = (lat, lng) => {
  return {
    type: "Point",
    coordinates: [lng, lat]
  };
};

const getCircleAsPolygon = (lat, lng, zoom, radius) => {
  if (_metersPerPixel[zoom] === undefined) {
    _metersPerPixel[zoom] =
      (40075016.686 * Math.abs(Math.cos((lat * Math.PI) / 180))) /
      Math.pow(2, zoom + 8);
  }
  return circle(
    latLngAsGeoJSON(lat, lng),
    (_metersPerPixel[zoom] * radius) / 1000,
    {
      //steps: 128
    }
  );
};

class RadialAreaPolygon extends React.Component {
  state = {
    geom: null
  };

  static getDerivedStateFromProps(props, state) {
    const { points, radius, zoom } = props;
    let combinedCircles = null;
    let circleApproximation;
    points.forEach(({ Lat, Lon }) => {
      circleApproximation = getCircleAsPolygon(Lat, Lon, zoom, radius);
      if (combinedCircles) {
        combinedCircles = union(combinedCircles, circleApproximation);
      } else {
        combinedCircles = circleApproximation;
      }
    });
    return {
      geom: combinedCircles
    };
  }
  render() {
    const { geom } = this.state;
    return (
      <GeoJSON
        fillOpacity={0.08}
        opacity={0.1}
        weight={1}
        color="white"
        className="RadialAreaPolygon"
        data={geom}
      />
    );
  }
}

RadialAreaPolygon.propTypes = {
  zoom: PropTypes.number.isRequired,
  radius: PropTypes.number.isRequired,
  points: PropTypes.array.isRequired,
};

export default RadialAreaPolygon;