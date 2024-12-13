import React from 'react';
import pops from '../assets/pop.json';
import regions from '../assets/regions.json';
import edgeZones from '../assets/edgezones.json';
import {BaseGlobeObject, GlobePin} from '../state/slice';
import {useTaskData} from '../hooks/useTaskData';

type PopObject = BaseGlobeObject<{
  type: 'pop';
  id: string;
  name: string;
  data: {
    location: {
      lat: number;
      long: number;
    };
  };
}>;

type RegionObject = BaseGlobeObject<{
  type: 'region';
  id: string;
  name: string;
  data: {
    location: {
      lat: number;
      long: number;
    };
  };
}>;

type EdgeZoneObject = BaseGlobeObject<{
  type: 'edgeZone';
  id: string;
  name: string;
  data: {
    location: {
      lat: number;
      long: number;
    };
  };
}>;

type ObjectConfig = {
  color: string;
  radius: number;
  altitude: number;
};

function parsePop(pop: (typeof pops)[number]): PopObject {
  return {
    id: pop.id,
    name: pop.campusName,
    type: 'pop' as const,
    data: {
      location: {
        lat: pop.latitude,
        long: pop.longitude,
      },
    },
  };
}

function parseRegion(region: (typeof regions)[number]): RegionObject {
  return {
    id: region.id,
    name: region.displayName,
    type: 'region' as const,
    data: {
      location: {
        lat: region.latitude,
        long: region.longitude,
      },
    },
  };
}

function parseEdgeZone(edgeZone: (typeof edgeZones)[number]): EdgeZoneObject {
  return {
    id: edgeZone.id,
    name: edgeZone.displayName,
    type: 'edgeZone' as const,
    data: {
      location: {
        lat: edgeZone.latitude,
        long: edgeZone.longitude,
      },
    },
  };
}

type AzureObject = PopObject | RegionObject | EdgeZoneObject;
type MapObject = GlobePin | AzureObject;

function useObjectProps(properties: Record<MapObject['type'], ObjectConfig>) {
  const [azureObjects, setAzureObjects] = React.useState<AzureObject[]>([]);
  const taskObjects = useTaskData();

  React.useEffect(() => {
    const objects: AzureObject[] = [];

    pops.forEach((pop) => objects.push(parsePop(pop)));
    regions.forEach((region) => objects.push(parseRegion(region)));
    edgeZones.forEach((edgeZone) => objects.push(parseEdgeZone(edgeZone)));

    setAzureObjects(objects);
  }, []);

  const props = React.useMemo(() => {
    return {
      pointsData: [...taskObjects, ...azureObjects],
      pointLat: (obj: GlobePin | AzureObject) => obj.data.location.lat,
      pointLng: (obj: GlobePin | AzureObject) => obj.data.location.long,
      pointColor: (obj: GlobePin | AzureObject) => properties[obj.type].color,
      pointAltitude: (obj: GlobePin | AzureObject) => properties[obj.type].altitude,
      pointRadius: (obj: GlobePin | AzureObject) => properties[obj.type].radius,
      pointsMerge: true,
      pointLabel: (obj: GlobePin | AzureObject) => obj.name,
    };
  }, [azureObjects, properties, taskObjects]);

  return props;
}

export {useObjectProps};
