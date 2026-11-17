 // Builds a getData controller for any "who is calling" property on req.
//   reqKey   - which property middleware put on req: "user", "organization", ...
//   Model    - the Mongoose model to read it from
//   exclude  - fields to hide, in Mongoose select syntax
//   populate - optional populate options
const createGetData =
  ({ reqKey, Model, exclude = "-password", populate = null }) =>
  async (req, res) => {
    try {
      const subject = req[reqKey];
      
      if (!subject) {
        return res.status(500).json({ message: `req.${reqKey} is not set` });
      }

      let query = Model.findById(subject._id).select(exclude);
      if (populate) query = query.populate(populate);
      const doc = await query;

      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.status(200).json({ [reqKey]: doc });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };

module.exports = createGetData;