const Professional = Parse.Object.extend("Professional");
const Specialty = Parse.Object.extend("Specialty");

Parse.Cloud.define(
  "v1-get-professionals",
  async (req) => {
    const query = new Parse.Query(Professional);
    query.include("specialties", "insurances", "services");

    if (req.params.specialtyId) {
      const specialty = new Specialty();
      specialty.id = req.params.specialtyId;
      query.equalTo("specialties", specialty);
    }

    if (req.params.lat && req.params.long) {
      const point = new Parse.GeoPoint({
        latitude: req.params.lat,
        longitude: req.params.long,
      });
      query.withinKilometers("location", point, req.params.maxDistance || 50);
    }

    if (req.params.limit && req.params.skip) {
      query.limit(req.params.limit);
      query.skip(req.params.skip);
    }

    const results = await query.find({ useMasterKey: true });
    return results.map((r) => formatProfessional(r.toJSON()));
  },
  {
    fields: {},
  }
);

function formatSpecialty(s) {
  return {
    id: s.objectId,
    name: s.name,
  };
}

function formatProfessional(p) {
  return {
    id: p.objectId,
    name: p.name,
    specialties: p.specialties.map((s) => formatSpecialty(s)),
    crm: p.crm,
  };
}
