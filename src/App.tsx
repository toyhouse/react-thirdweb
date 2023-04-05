
import { useStorageUpload, MediaRenderer } from "@thirdweb-dev/react";
import { useCallback, useState } from "react"
import {useDropzone} from 'react-dropzone'
import "./styles/Home.css";

export default function Home() {

  interface RawData {
    data: {
      nama_produk: string;
      no_produk:string;
    }
  }
  interface Props {
    records: FlattenedRecord[];
  }

  interface FlattenedRecord {
      nama_produk: string;
      no_produk:string;
      produk_gambar:string;
  }

  const IPFS_PREFIX = "ipfs://"
  const GATEWAY_URL = "https://ipfs.io/ipfs/";

  const [uris, setUris] = useState<string []>([]);
  const [records, setRecords] = useState<FlattenedRecord []>([]);

  const {mutateAsync: upload} = useStorageUpload();
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const _uris = await upload({data:acceptedFiles});
      setUris(_uris);    },
    [upload]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const getAFile = async () => {
    const uri = uris[0]
    const fileName = GATEWAY_URL + uri.slice(IPFS_PREFIX.length)
    console.log("getting a file new: " + fileName)
    const response = await fetch(fileName);
    const resultData = await response.json()
    const flattenedData = resultData.map( (item:RawData) => item.data)
    setRecords(flattenedData)
    console.log(flattenedData)
    return null;             
  }

  const isJSONPostFix = (): boolean => {
    const uri: string = uris[0];
    const subStr: string = ".json";
    if (uri?.endsWith(subStr)) {
      return true;
    } else {
      return false;
    }
  }

  function ImageCells(inputArray: string[]) {
    return (
      <table>
        <tbody>
            <tr>
            {inputArray.map((item) => (<td key={item}><img src={item}  width="40px" alt={item}/></td>))}
            </tr>    
        </tbody>
      </table>
    );
  }

  function splitString(inputString: string): string[] {
    if (inputString != null && inputString.includes("|")){
      // Split the input string into an array using "|" as the delimiter
      const substrings: string[] = inputString.split("|");
      return substrings;
    } else {
      return [inputString];
    }
  }

  function ProductTable({ records }: Props) {
    return (
      <table>
        <thead>
          <tr className="tableHeader" key="TITLE ROW">
            <th className="tableHeader">SOME TABLE</th>
          </tr>
        </thead>
        <tbody>
          {records.map((item) => (
            <tr key={item?.nama_produk}>
              <td>{item?.nama_produk}</td> <td>{item?.no_produk}</td> 
              <td>{ImageCells(splitString(item?.produk_gambar))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }



  return (
    <div className="container">
      <h2>Hello World</h2>
      <hr />

      <div {...getRootProps()}>
      <input {...getInputProps()} />
      <button>Drop files here to upload them to IPFS</button>
    </div>
    <div>
    {uris.map(uri => {
      

      const hyperlink = GATEWAY_URL + uri.slice(IPFS_PREFIX.length);
      return (
        <>
      <MediaRenderer 
          key={uri}
          src={uri}
          alt="Image"
          width="400px"
        />
        <h2 className="URI"><a href={hyperlink}>URIs: {uri.slice(0)}</a></h2>
        
        </>

        )

    })}
          {isJSONPostFix() ? <button onClick={getAFile}>Get a file</button>:null}
          {records.length > 0 
          ? <div><h2 >SHOW DATA of count:{records.length}</h2> 
          <ProductTable records={records} />
          </div>
          :null}

      </div>
    </div>
  );
}
