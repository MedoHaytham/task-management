const asyncWrapper = require('../utils/asyncWrapper');
const httpStatus = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const APIfeatures = require('../utils/apiFeatures');
const { filterObj } = require('../utils/filterObject');

// req.baseFilter can be set by route-specific middleware to restrict results
// e.g. { $or: [{ owner: req.user.id }, { members: req.user.id }] } for projects
exports.getAll = (Model, searchFields = [], queryOptions = {}) => asyncWrapper(
  async (req, res, next) => {

    const filter = req.baseFilter || {};

    const features = new APIfeatures(Model.find(filter).setOptions(queryOptions), req.query)
      .search(searchFields)
      .filter()
      .sort()
      .limitFields();

    // To get total number of documents matching the filter
    const total = await Model.countDocuments(features.query.getFilter());

    features.paginate();
    const doc = await features.query;

    res.status(200).json({
      status: httpStatus.SUCCESS,
      total,
      results: doc.length,
      data: {
        data: doc
      }
    });
  }
);

exports.getOne = (Model, populateOptions, queryOptions = {}) => asyncWrapper(
  async (req, res, next) => {

    let query = Model.findById(req.params.id).setOptions(queryOptions);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: httpStatus.SUCCESS,
      data: {
        data: doc,
      }
    });
  }
);

// extraData: optional function (req) => object, merged into the body
// used to inject server-controlled fields (creator, project, owner)
// that must NOT come from the client directly
exports.createOne = (Model, extraData) => asyncWrapper(
  async (req, res, next) => {
    const body = extraData ? { ...req.body, ...extraData(req) } : req.body;

    const doc = await Model.create(body);

    res.status(201).json({
      status: httpStatus.SUCCESS,
      data: {
        data: doc,
      }
    });
  }
);

// allowedFields: whitelist of fields the client is permitted to update
// prevents mass assignment attacks (e.g. sending { role: 'admin' })
exports.updateOne = (Model, allowedFields = [], queryOptions = {}) => asyncWrapper(
  async (req, res, next) => {
    const { id } = req.params;

    const body = allowedFields.length > 0
      ? filterObj(req.body, ...allowedFields)
      : req.body;

    const doc = await Model.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
      ...queryOptions
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: httpStatus.SUCCESS,
      data: {
        data: doc,
      }
    });
  }
);

exports.deleteOne = Model => asyncWrapper(
  async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: httpStatus.SUCCESS,
      data: null
    });
  }
);