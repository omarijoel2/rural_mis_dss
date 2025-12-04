declare module 'shpjs' {
  import { FeatureCollection } from 'geojson';
  
  function shp(input: Buffer | ArrayBuffer | string): Promise<FeatureCollection | FeatureCollection[]>;
  
  export = shp;
}
