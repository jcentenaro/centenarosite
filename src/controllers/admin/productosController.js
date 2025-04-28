const index = (req, res) => {
    res.send('Página de Listado de Productos');
};

const store = (req, res) => {
    console.log(req.body);
    res.send('Página de Crear Producto');
};

const update = (req, res) => {
    console.log(req.params, req.body);
    res.send('Producto Modificado');
};

const destroy = (req, res) => {
    console.log(req.params);
    res.send('Producto Borrado');
};

module.exports = {
    index,
    store,
    update,
    destroy
}
