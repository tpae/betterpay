import IPFS from 'ipfs-http-client';
import { getBytes32FromIpfsHash, getIpfsHashFromBytes32 } from './hash';

function getIPFS(host='ipfs.infura.io', port=5001, protocol='https') {
  const ipfs = new IPFS({ host, port, protocol });

  return {
    add: async (data) => {
      const res = await ipfs.add(JSON.stringify(data));
      return getBytes32FromIpfsHash(res[0].hash);
    },
    get: async (hash) => {
      const ipfsHash = getIpfsHashFromBytes32(hash);
      const res = await ipfs.cat(ipfsHash);
      return JSON.parse(res.toString());
    }
  }
}

export default getIPFS;
