from django.test import TestCase  # super important to load TestCase like this! fixtures won't load otherwise
from django.test.client import Client


class URLTest(TestCase):
    fixtures = ['testdata.json']

    @classmethod
    def setUp(self):
        self.client = Client()

    def test_index(self):
        response = self.client.get("/quiz/")
        self.assertEqual(response.status_code, 200)

    def test_test_run_by_tc_id_and_tc_task_id(self):
        response = self.client.get('/quiz/test/run/2/1/')
        self.assertEqual(response.status_code, 200)

    def test_result_tc_id_and_tc_task_id(self):
        response = self.client.get('/quiz/test/result/1/0/')
        self.assertEqual(response.status_code, 200)

    def test_by_tc_id(self):
        response = self.client.get('/quiz/test/1/')
        self.assertEqual(response.status_code, 200)

    def test_result_by_task_id(self):
        # should fail
        with self.assertRaises(ZeroDivisionError):
            response = self.client.get('/quiz/result/1/')

    def test_explicit_by_task_id(self):
        response = self.client.get('/quiz/explicit/12/')
        self.assertEqual(response.status_code, 200)