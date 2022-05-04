import needle, { NeedleOptions } from 'needle';

import { parseSpiceBody, SPICE_BASE } from '../util';

/** A type of DNS record. */
export enum DNSRecordType {
  ANY = 'any',
  A = 'a',
  AAAA = 'aaaa',
  AFSDB = 'afsdb',
  APL = 'apl',
  CAA = 'caa',
  CERT = 'cert',
  CNAME = 'cname',
  DHCID = 'dhcid',
  DLV = 'dlv',
  DNAME = 'dname',
  DNSKEY = 'dnskey',
  DS = 'ds',
  HIP = 'hip',
  IPSECKEY = 'ipseckey',
  KEY = 'key',
  KX = 'kx',
  LOC = 'loc',
  MX = 'mx',
  NS = 'ns',
  NSEC = 'nsec',
  NSEC3 = 'nsec3',
  NSEC3PARAM = 'nsec3param',
  RRSIG = 'rrsig',
  RP = 'rp',
  SIG = 'sig',
  SOA = 'soa',
  SPF = 'spf',
  SRV = 'srv',
  SSHFP = 'sshfp',
  TA = 'ta',
  TKEY = 'tkey',
  TLSA = 'tlsa',
  TSIG = 'tsig',
  TX = 'tx',
  TXT = 'txt'
}

/** A DNS record. */
export interface DNSRecord {
  name: string;
  ttl: string;
  class: 'IN';
  type: DNSRecordType;
  data: string;
}

/**
 * The result from the dns spice.
 */
export interface DNSResult {
  query: {
    tool: 'dnsrecord_PRO';
    domain: string;
    recordtype: DNSRecordType;
  };
  response: {
    records: DNSRecord[];
  };
}

/**
 * Get DNS records of a domain.
 * Data provided by ViewDNS.info.
 * @category Spice
 * @see https://viewdns.info/
 * @param from The domain name to lookup
 * @param recordType The type of DNS record to retrieve
 * @param needleOptions The options for the HTTP request
 * @since v2.1.0
 * @returns The dns result
 */
export async function dns(domain: string, recordType = DNSRecordType.ANY, needleOptions?: NeedleOptions): Promise<DNSResult> {
  if (!domain) throw new Error('Domain cannot be empty!');

  const response = await needle('get', `${SPICE_BASE}/dns/${recordType}/${domain}`, needleOptions);
  const result = parseSpiceBody(response.body) as DNSResult;

  return result;
}
