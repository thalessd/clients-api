export class Neo4jHelper {
  static formatResponse<T>(resultObj): T[] {
    const result = [];
    if (resultObj.records.length > 0) {
      resultObj.records.map((record) => {
        result.push(record._fields[0].properties);
      });
    }
    return result;
  }
}
