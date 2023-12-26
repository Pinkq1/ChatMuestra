
//admin
const { createApp } = Vue;

const app1 = createApp({
  data() {
    return {
      records: [],
      newProduct: {
        pro_nombre: "",
        pro_descripcion: "",
        pro_stock: 0,
        pro_precio: 0,
        pro_proveedor: "",
      },
      editingRecord: {
        pro_nombre: "",
        pro_descripcion: "",
        pro_stock: 0,
        pro_precio: 0,
        pro_proveedor: "",
        database_id: ""
      },
    };
  },
  async mounted() {
    await this.getDataFromAirtable();
    console.log(this.records);
  },
  computed: {
    savedRecords() {
      console.log(this.records);
      return this.records;
    }
  },
  methods: {
   async getDataFromAirtable() {
      const airtableUrl =
        "https://api.airtable.com/v0/appWYcqn38utQbdcA/Producto";


      await axios
        .get(airtableUrl, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          params: {
            sort: [
              { field: "pro_id", direction: "asc" },
            ],
          },
        })
        .then((response) => {
          this.records = response.data.records;
        })
        .catch((error) => {
          console.error("Error al obtener datos de Airtable:", error);
        });
    },
    openEditProductModal(record) {
      this.editingRecord = {
        pro_nombre: record.fields.pro_nombre,
        pro_descripcion: record.fields.pro_descripcion,
        pro_stock: record.fields.pro_stock,
        pro_precio: record.fields.pro_precio,
        pro_proveedor: record.fields.pro_proveedor,
        ...(record.id && { database_id: record.id }),
      };

      console.log(this.editingRecord);
      console.log(record);
      var myModal = document.getElementById("openEditProductModal");
      var modalInstance = new bootstrap.Modal(myModal);
      modalInstance.show();
    },
    closeEditProductModal(){
      var myModal = document.getElementById("openEditProductModal");
  if (myModal) {
    var modalInstance = new bootstrap.Modal(myModal);
    modalInstance.hide();
  } else {
    console.error("El modal no fue encontrado en el DOM.");
  }
    },
    editRecord(record) {
      this.editingRecord = {
        pro_nombre: record.fields.pro_nombre,
        pro_descripcion: record.fields.pro_descripcion,
        pro_stock: record.fields.pro_stock,
        pro_precio: record.fields.pro_precio,
        pro_proveedor: record.fields.pro_proveedor,
      };
      if (this.editingRecord) {
        this.openEditProductModal();
      }
      console.log("Editar:", this.editingRecord);
    },
    saveEdit() {
      const recordId = this.editingRecord.database_id;
      console.log("Record ID:", recordId);
      console.log("Editing Record:", this.editingRecord);

      const airtableUrl = `https://api.airtable.com/v0/appWYcqn38utQbdcA/Producto/${recordId}`;


      if (recordId) {
        const { pro_nombre, pro_descripcion, pro_stock, pro_precio, pro_proveedor } = this.editingRecord;
        axios
          .put(
            airtableUrl,
            { fields: { pro_nombre, pro_descripcion, pro_stock, pro_precio, pro_proveedor }, typecast: true },
            {
              headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then((response) => {
            console.log("Producto editado con éxito:", response.data);

            this.getDataFromAirtable();
            this.editingRecord = {
              pro_nombre: "",
              pro_descripcion: "",
              pro_stock: 0,
              pro_precio: 0,
              pro_proveedor: "",
            };

             this.closeEditProductModal();
          })
          .catch((error) => {
            console.error("Axios Error:", error);
            console.error("Error al editar el registro:", error);
          });


      } else {
        console.error("Error: editingRecord or editingRecord.pro_id is null");
      }
    },
    cancelEdit() {
      this.editingRecord = null;

      var editModal = new bootstrap.Modal(document.getElementById("editProductModal"));
      editModal.hide();
    },
    deleteRecord(record) {
      const recordId = record.id;
      const proId = record.fields.pro_id;


      if (confirm("¿Seguro que deseas eliminar este registro?")) {
        axios
          .delete(`https://api.airtable.com/v0/appWYcqn38utQbdcA/Producto/${recordId}`, {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
            },
          })
          .then(() => {
            this.getDataFromAirtable();
            console.log("Registro eliminado con éxito.");
          })
          .catch((error) => {
            console.error("Error al eliminar el registro:", error);
          });
      }
    },
    openAddProductModal() {
      var myModal = document.getElementById("openAddProductModal");
      var modalInstance = new bootstrap.Modal(myModal);
      modalInstance.show();
    },
    addProduct() {
      const airtableUrl =
        "https://api.airtable.com/v0/appWYcqn38utQbdcA/Producto";

      axios
        .post(
          airtableUrl, { fields: this.newProduct, typecast: true
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          console.log("Producto agregado con éxito:", response.data);

          this.getDataFromAirtable();
          this.newProduct = {
            pro_id: "",
            pro_nombre: "",
            pro_descripcion: "",
            pro_stock: 0,
            pro_precio: 0,
            pro_proveedor: "",
          };
        })
        .catch((error) => {
          console.error("Error al agregar el producto:", error);
        });
    },
  },
})

app1.config.globalProperties.apiKey = "pat39z6JQcPgH2ySk.c8fd5641e410ca19d3d9efaed0e33aaecb983f65ffc9949e58278e7f094a3a8b",
app1.mount("#app-admin");




// Index
const app2 = createApp({
  data() {
    return {
      products: [],
      cart: [],
    };
  },
  methods: {

    addToCart(product) {
      this.cart.push({ id: product.pro_id, name: product.pro_nombre, price: product.pro_precio });
    },
    getTotal() {
      return this.cart.reduce((total, item) => total + item.price, 0);
    },
    fetchData() {
      const airtableURL = 'https://api.airtable.com/v0/appWYcqn38utQbdcA/Producto';


      axios.get(airtableURL, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      })
        .then(response => {
          this.products = response.data.records.map(record => ({
            pro_id: record.fields.id,
            pro_nombre: record.fields.pro_nombre,
            pro_descripcion: record.fields.pro_descripcion,
            pro_stock: record.fields.pro_stock,
            pro_precio: record.fields.pro_precio,
            pro_proveedor: record.fields.pro_proveedor,
          }));
        })
        .catch(error => {
          console.error("Error al obtener datos de Airtable:", error);
          console.log("Detalles del error:", error.response);
        });
    },
  },
  async mounted() {
   await this.fetchData();
   
  },
  
})
app2.config.globalProperties.apiKey = "pat39z6JQcPgH2ySk.c8fd5641e410ca19d3d9efaed0e33aaecb983f65ffc9949e58278e7f094a3a8b",
app2.mount("#app-index");

//login