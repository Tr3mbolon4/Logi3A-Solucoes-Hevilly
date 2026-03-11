import requests
import sys
import json
from datetime import datetime

class Logi3AAPITester:
    def __init__(self, base_url="https://logi3a-simulator.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.created_materials = []

    def run_test(self, name, method, endpoint, expected_status, data=None, check_response=True):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json() if check_response else {}
                    if response_data:
                        print(f"   Response preview: {str(response_data)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error details: {error_detail}")
                except:
                    print(f"   Response text: {response.text[:200]}...")
                
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "error": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoints(self):
        """Test basic API endpoints"""
        print("\n📍 Testing Root Endpoints...")
        
        self.run_test("Root API", "GET", "", 200)
        self.run_test("Health Check", "GET", "health", 200)

    def test_seed_data(self):
        """Test seeding demo data"""
        print("\n🌱 Testing Seed Data...")
        
        success, response = self.run_test("Seed Demo Data", "POST", "seed", 200)
        return success

    def test_materiais_crud(self):
        """Test materials CRUD operations"""
        print("\n📦 Testing Materials CRUD...")
        
        # List materials
        success, materials = self.run_test("List Materials", "GET", "materiais", 200)
        if success:
            print(f"   Found {len(materials)} materials")

        # Create new material
        test_material = {
            "nome": "Material de Teste",
            "codigo": "TEST123456",
            "setor": "Expedição",
            "quantidade": 100,
            "tipo_operacao": "Expedição",
            "descricao": "Material criado para teste automático",
            "localizacao": "Área de Teste"
        }
        
        success, created = self.run_test("Create Material", "POST", "materiais", 201, test_material)
        if success and 'id' in created:
            material_id = created['id']
            self.created_materials.append(material_id)
            print(f"   Created material with ID: {material_id}")
            
            # Get specific material
            self.run_test("Get Material by ID", "GET", f"materiais/{material_id}", 200)
            
            # Get material by code
            self.run_test("Get Material by Code", "GET", f"materiais/codigo/{test_material['codigo']}", 200)
            
            # Update material
            update_data = {
                "nome": "Material de Teste Atualizado",
                "quantidade": 150
            }
            self.run_test("Update Material", "PUT", f"materiais/{material_id}", 200, update_data)
            
            # Test invalid material ID
            self.run_test("Get Non-existent Material", "GET", "materiais/invalid-id", 404, check_response=False)

    def test_leituras_crud(self):
        """Test readings CRUD operations"""
        print("\n📊 Testing Readings CRUD...")
        
        # List readings
        success, leituras = self.run_test("List Readings", "GET", "leituras", 200)
        if success:
            print(f"   Found {len(leituras)} readings")

        # Create test reading
        test_leitura = {
            "codigo": "TEST123456",
            "produto": "Material de Teste",
            "tipo_operacao": "Expedição",
            "tipo_leitura": "qrcode",
            "setor": "Expedição",
            "quantidade": 1,
            "aluno": "Teste User",
            "turma": "Turma A",
            "pontuacao": 10
        }
        
        success, created_leitura = self.run_test("Create Reading", "POST", "leituras", 201, test_leitura)
        if success and 'id' in created_leitura:
            leitura_id = created_leitura['id']
            print(f"   Created reading with ID: {leitura_id}")
            
            # Test filtering readings
            self.run_test("Filter by QR Code", "GET", "leituras?tipo_leitura=qrcode", 200)
            self.run_test("Filter by Operation", "GET", "leituras?tipo_operacao=Expedição", 200)
            self.run_test("Filter by Student", "GET", "leituras?aluno=Teste", 200)

    def test_estatisticas(self):
        """Test statistics endpoint"""
        print("\n📈 Testing Statistics...")
        
        success, stats = self.run_test("Get Statistics", "GET", "estatisticas", 200)
        if success:
            required_fields = [
                'total_leituras', 'leituras_qrcode', 'leituras_barcode',
                'total_materiais', 'leituras_por_operacao', 'leituras_por_setor',
                'leituras_hoje', 'pontuacao_total'
            ]
            
            missing_fields = [field for field in required_fields if field not in stats]
            if missing_fields:
                print(f"   ⚠️  Missing fields in stats: {missing_fields}")
            else:
                print(f"   ✅ All required statistics fields present")
                print(f"   Total readings: {stats['total_leituras']}")
                print(f"   Total materials: {stats['total_materiais']}")

    def cleanup(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete created materials
        for material_id in self.created_materials:
            self.run_test(f"Delete Material {material_id}", "DELETE", f"materiais/{material_id}", 200, check_response=False)

    def print_summary(self):
        """Print test summary"""
        print(f"\n{'='*50}")
        print(f"📊 TEST SUMMARY")
        print(f"{'='*50}")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test.get('error', 'Status code mismatch')}")
        
        return len(self.failed_tests) == 0

def main():
    print("🚀 Starting Logi3A API Testing...")
    print(f"Testing backend at: https://logi3a-simulator.preview.emergentagent.com")
    
    tester = Logi3AAPITester()
    
    try:
        # Run all test suites
        tester.test_root_endpoints()
        tester.test_seed_data()
        tester.test_materiais_crud()
        tester.test_leituras_crud()
        tester.test_estatisticas()
        
        # Clean up test data
        tester.cleanup()
        
        # Print summary and return appropriate exit code
        success = tester.print_summary()
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\nUnexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())