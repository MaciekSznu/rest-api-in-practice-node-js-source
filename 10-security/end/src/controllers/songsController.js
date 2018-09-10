import Song from '../models/song';

export default {
    async findOne(req, res, next) {
        const song = await Song.findOne({ slug: req.params.slug });
        if (!song) return next();
        return res.status(200).send({ data: song });
    },

    async findAll(req, res) {
        let sort_by = {};
        sort_by[req.query.sort_by || 'createdAt'] = req.query.order_by || 'desc';
        if (req.query.q) sort_by = { score: { $meta: 'textScore' } };

        const offset = parseInt(req.query.offset) || 0;
        const per_page = parseInt(req.query.per_page) || 2;
        const songsPromise =
            Song.find(req.filters, { score: { $meta: 'textScore' } })
                .skip(offset)
                .limit(per_page)
                .sort(sort_by);

        const countPromise = Song.countDocuments(req.filters);
        const [songs, count] = await Promise.all([songsPromise, countPromise]);
        return res.status(200).send({ data: songs, count });
    },

    async create(req, res) {
        const song = await new Song({
            title: req.body.title,
            genre: req.body.genre,
            duration: req.body.duration
        }).save();

        return res.status(201).send({ data: song, message: `Song was created` });
    },

    async update(req, res, next) {
        const song = await Song.find({ 'slug': req.params.slug });
        if (!song) return next();

        song.title = req.body.title;
        await song.save();

        return res.status(200).send({ data: song, message: `Song was updated` });
    },

    async remove(req, res, next) {
        const song = await Song.findOne({ 'slug': req.params.slug });
        if (!song) return next();
        await song.remove();

        return res.status(200).send({ message: `Song was removed` });
    }
}