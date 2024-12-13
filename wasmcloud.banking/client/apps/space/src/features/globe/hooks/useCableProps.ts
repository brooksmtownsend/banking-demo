import React from 'react';

type LatLng = [number, number];
type Path = {coords: LatLng; properties: {name: string; color: string}};

function useCableProps({color}: {color: string}) {
  const [cablePaths, setCablePaths] = React.useState<Path[]>([]);

  React.useEffect(() => {
    // from https://www.submarinecablemap.com
    fetch('/data/cables.json')
      .then((r) => r.json())
      .then((cablesGeo) => {
        const cablePaths: Path[] = [];
        cablesGeo.features.forEach(
          ({
            geometry,
            properties,
          }: {
            geometry: {coordinates: LatLng[]};
            properties: {name: string; color: string};
          }) => {
            geometry.coordinates.forEach((coords) => cablePaths.push({coords, properties}));
          },
        );

        setCablePaths(cablePaths);
      });
  }, []);

  const props = React.useMemo(() => {
    return {
      pathsData: cablePaths,
      pathPoints: 'coords',
      pathPointLat: (p: LatLng) => p[1],
      pathPointLng: (p: LatLng) => p[0],
      pathColor: (p: Path) => color || p.properties.color,
      pathDashLength: 0.1,
      pathDashGap: 0.008,
      pathDashAnimateTime: 12000,
    };
  }, [cablePaths, color]);

  return props;
}

export {useCableProps};
